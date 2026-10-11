import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { AuthSession } from "./auth-session.model.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";
import { env } from "../../config/env.js";
import { requireAuth, type AuthPrincipal } from "../../common/middleware/require-auth.js";
import { User, type UserRecord } from "../users/user.model.js";

const router = Router();
const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_COOKIE = "refreshToken";
const COOKIE_PATH = "/api/v1/auth";

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: COOKIE_PATH,
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function newRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

function createAccessToken(user: UserRecord): string {
  return jwt.sign({ role: user.role }, env.JWT_ACCESS_SECRET, {
    subject: user._id.toString(),
    expiresIn: "15m",
    issuer: "mern-starter-api",
    audience: "mern-starter-web",
  });
}

function publicUser(user: UserRecord) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function sendUnauthorized(res: Parameters<import("express").RequestHandler>[1]): void {
  res.status(401).json({
    success: false,
    error: { code: "INVALID_CREDENTIALS", message: "Invalid or expired credentials" },
    requestId: res.locals.requestId,
  });
}

async function startSession(
  user: UserRecord,
  req: import("express").Request,
  res: import("express").Response,
) {
  const rawRefreshToken = newRefreshToken();
  await AuthSession.create({
    userId: user._id,
    tokenHash: hashToken(rawRefreshToken),
    previousTokenHash: null,
    expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS),
    revokedAt: null,
    userAgent: req.get("user-agent")?.slice(0, 512),
    ipAddress: req.ip?.slice(0, 128),
  });

  res.cookie(REFRESH_COOKIE, rawRefreshToken, {
    ...cookieOptions,
    maxAge: SESSION_LIFETIME_MS,
  });

  return {
    accessToken: createAccessToken(user),
    user: publicUser(user),
  };
}

function clearRefreshCookie(res: import("express").Response): void {
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
}

router.post("/register", authRateLimit, async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: input.email }).select("_id");
    if (existing) {
      res.status(409).json({
        success: false,
        error: { code: "EMAIL_IN_USE", message: "An account with this email already exists" },
        requestId: res.locals.requestId,
      });
      return;
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: "user",
    });
    const session = await startSession(user, req, res);

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      res.status(409).json({
        success: false,
        error: { code: "EMAIL_IN_USE", message: "An account with this email already exists" },
        requestId: res.locals.requestId,
      });
      return;
    }
    next(error);
  }
});

router.post("/login", authRateLimit, async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await User.findOne({ email: input.email }).select("+passwordHash");

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      sendUnauthorized(res);
      return;
    }

    const session = await startSession(user, req, res);
    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
});

router.post("/refresh", refreshRateLimit, async (req, res, next) => {
  try {
    const rawToken: unknown = req.cookies?.[REFRESH_COOKIE];
    if (typeof rawToken !== "string" || rawToken.length < 32) {
      clearRefreshCookie(res);
      sendUnauthorized(res);
      return;
    }

    const currentHash = hashToken(rawToken);
    const now = new Date();
    const session = await AuthSession.findOne({
      tokenHash: currentHash,
      revokedAt: null,
      expiresAt: { $gt: now },
    });

    if (!session) {
      const reusedSession = await AuthSession.findOne({
        previousTokenHash: currentHash,
        revokedAt: null,
      });
      if (reusedSession) {
        reusedSession.revokedAt = now;
        await reusedSession.save();
      }
      clearRefreshCookie(res);
      sendUnauthorized(res);
      return;
    }

    const user = await User.findById(session.userId);
    if (!user) {
      session.revokedAt = now;
      await session.save();
      clearRefreshCookie(res);
      sendUnauthorized(res);
      return;
    }

    const nextRawToken = newRefreshToken();
    const nextHash = hashToken(nextRawToken);
    const rotated = await AuthSession.findOneAndUpdate(
      {
        _id: session._id,
        tokenHash: currentHash,
        revokedAt: null,
        expiresAt: { $gt: now },
      },
      {
        $set: {
          previousTokenHash: currentHash,
          tokenHash: nextHash,
          expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS),
        },
      },
      { new: true },
    );

    if (!rotated) {
      const racedSession = await AuthSession.findOne({
        previousTokenHash: currentHash,
        revokedAt: null,
      });
      if (racedSession) {
        racedSession.revokedAt = new Date();
        await racedSession.save();
      }
      clearRefreshCookie(res);
      sendUnauthorized(res);
      return;
    }

    res.cookie(REFRESH_COOKIE, nextRawToken, {
      ...cookieOptions,
      maxAge: SESSION_LIFETIME_MS,
    });
    res.json({
      success: true,
      data: {
        accessToken: createAccessToken(user),
        user: publicUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const rawToken: unknown = req.cookies?.[REFRESH_COOKIE];
    if (typeof rawToken === "string" && rawToken.length >= 32) {
      const tokenHash = hashToken(rawToken);
      await AuthSession.findOneAndUpdate(
        {
          $or: [{ tokenHash }, { previousTokenHash: tokenHash }],
          revokedAt: null,
        },
        { $set: { revokedAt: new Date() } },
      );
    }

    clearRefreshCookie(res);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (_req, res, next) => {
  try {
    const principal = res.locals.authUser as AuthPrincipal;
    const user = await User.findById(principal.userId);
    if (!user) {
      sendUnauthorized(res);
      return;
    }

    res.json({ success: true, data: { user: publicUser(user) } });
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };
