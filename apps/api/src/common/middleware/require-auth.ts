import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import type { UserRole } from "../../modules/users/user.model.js";

export interface AuthPrincipal {
  userId: string;
  role: UserRole;
}

function unauthorized(res: Parameters<RequestHandler>[1]): void {
  res.status(401).json({
    success: false,
    error: { code: "UNAUTHORIZED", message: "Authentication is required" },
    requestId: res.locals.requestId,
  });
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const authorization = req.header("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    unauthorized(res);
    return;
  }

  try {
    const decoded = jwt.verify(match[1]!, env.JWT_ACCESS_SECRET, {
      issuer: "mern-starter-api",
      audience: "mern-starter-web",
    });
    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string" ||
      (decoded.role !== "user" && decoded.role !== "admin")
    ) {
      unauthorized(res);
      return;
    }

    res.locals.authUser = {
      userId: decoded.sub,
      role: decoded.role,
    } satisfies AuthPrincipal;
    next();
  } catch {
    unauthorized(res);
  }
};

export function requireRole(...allowedRoles: UserRole[]): RequestHandler {
  return (_req, res, next) => {
    const principal = res.locals.authUser as AuthPrincipal | undefined;
    if (!principal) {
      unauthorized(res);
      return;
    }

    if (!allowedRoles.includes(principal.role)) {
      res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "You do not have permission to perform this action" },
        requestId: res.locals.requestId,
      });
      return;
    }

    next();
  };
}
