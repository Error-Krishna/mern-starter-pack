import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth.schemas.js";

describe("authentication schemas", () => {
  it("normalizes email addresses and accepts a valid registration", () => {
    const result = registerSchema.safeParse({
      name: "  Krishna Goyal  ",
      email: "  KRISHNA@example.com ",
      password: "a-long-password-123",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Krishna Goyal");
      expect(result.data.email).toBe("krishna@example.com");
    }
  });

  it("rejects weak registration passwords", () => {
    const result = registerSchema.safeParse({
      name: "Example User",
      email: "user@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });

  it("rejects malformed email addresses", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "any-password",
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing registration fields", () => {
    expect(registerSchema.safeParse({}).success).toBe(false);
  });
});
