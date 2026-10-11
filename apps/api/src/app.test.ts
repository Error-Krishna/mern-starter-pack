import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "./app.js";

describe("API", () => {
  it("returns API information", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("returns a liveness response", async () => {
    const response = await request(app).get("/health/live");

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("alive");
  });

  it("returns a consistent not-found response", async () => {
    const response = await request(app).get("/missing-route");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("ROUTE_NOT_FOUND");
  });
});
