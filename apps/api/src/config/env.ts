import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  MONGODB_URI: z.string().min(1),
  CORS_ORIGIN: z.string().url(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  JWT_ACCESS_SECRET: z.string().min(32).optional(),
});

const parsedEnv = envSchema.parse(process.env);

if (
  parsedEnv.NODE_ENV === "production" &&
  (!parsedEnv.JWT_ACCESS_SECRET || parsedEnv.JWT_ACCESS_SECRET.startsWith("replace-this"))
) {
  throw new Error("JWT_ACCESS_SECRET must be set to a unique random secret in production");
}

export const env = {
  ...parsedEnv,
  JWT_ACCESS_SECRET:
    parsedEnv.JWT_ACCESS_SECRET ?? "local-development-only-secret-change-before-production",
};
