import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app.js";

describe("Health API", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
