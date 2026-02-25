import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app.js";

describe("Protected routes", () => {
  it("GET /api/influencers returns 401 without token", async () => {
    const res = await request(app).get("/api/influencers");
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it("POST /api/influencers returns 401 without token", async () => {
    const res = await request(app)
      .post("/api/influencers")
      .send({ name: "Test Influencer" });
    expect(res.status).toBe(401);
  });

  it("GET /api/analytics/:id returns 401 without token", async () => {
    const res = await request(app).get("/api/analytics/some-id");
    expect(res.status).toBe(401);
  });

  it("GET /api/growth/sales returns 401 without token", async () => {
    const res = await request(app).get("/api/growth/sales");
    expect(res.status).toBe(401);
  });

  it("GET /api/influencers returns 401 with invalid token", async () => {
    const res = await request(app)
      .get("/api/influencers")
      .set("Authorization", "Bearer invalid-token");
    expect(res.status).toBe(401);
  });
});
