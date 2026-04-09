import jwt from "jsonwebtoken";
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import * as influencerService from "../services/influencer.service.js";

vi.mock("../services/influencer.service.js");
vi.mock("../lib/n8n.js", () => ({
  notifyN8nInfluencerCreated: vi.fn().mockResolvedValue(undefined),
}));

function authHeader() {
  const token = jwt.sign(
    { userId: "user-1", email: "test@test.com" },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );
  return { Authorization: `Bearer ${token}` };
}

describe("Influencers API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/influencers returns list for authenticated user", async () => {
    vi.mocked(influencerService.listByUser).mockResolvedValue([]);

    const res = await request(app).get("/api/influencers").set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
    expect(influencerService.listByUser).toHaveBeenCalledWith("user-1");
  });

  it("POST /api/influencers returns 400 when name is missing", async () => {
    const res = await request(app).post("/api/influencers").set(authHeader()).send({ instagramHandle: "only" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Name required");
    expect(influencerService.create).not.toHaveBeenCalled();
  });

  it("POST /api/influencers returns 201 and created influencer", async () => {
    const created = {
      id: "inf-1",
      name: "Alex",
      instagramHandle: "alex",
      email: null,
      notes: null,
      userId: "user-1",
      status: "active",
      addedAt: new Date(),
      outreachEmailContent: null,
      repliedAt: null,
      completedAt: null,
    };
    vi.mocked(influencerService.create).mockResolvedValue(created as never);

    const res = await request(app).post("/api/influencers").set(authHeader()).send({ name: "Alex", instagramHandle: "alex" });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe("inf-1");
    expect(res.body.name).toBe("Alex");
    expect(influencerService.create).toHaveBeenCalledWith("user-1", {
      name: "Alex",
      instagramHandle: "alex",
      email: undefined,
      notes: undefined,
    });
  });

  it("PATCH /api/influencers/:id/status returns 400 for invalid status", async () => {
    const res = await request(app)
      .patch("/api/influencers/inf-1/status")
      .set(authHeader())
      .send({ status: "not-a-status" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid status");
    expect(influencerService.updateStatus).not.toHaveBeenCalled();
  });

  it("PATCH /api/influencers/:id/status returns updated influencer", async () => {
    const inf = { id: "inf-1", name: "Alex", status: "waiting" };
    vi.mocked(influencerService.updateStatus).mockResolvedValue({ count: 1 } as never);
    vi.mocked(influencerService.getById).mockResolvedValue(inf as never);

    const res = await request(app).patch("/api/influencers/inf-1/status").set(authHeader()).send({ status: "waiting" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(inf);
    expect(influencerService.updateStatus).toHaveBeenCalledWith("inf-1", "user-1", "waiting");
  });

  it("DELETE /api/influencers/:id returns 204", async () => {
    vi.mocked(influencerService.remove).mockResolvedValue(undefined);

    const res = await request(app).delete("/api/influencers/inf-1").set(authHeader());

    expect(res.status).toBe(204);
    expect(influencerService.remove).toHaveBeenCalledWith("inf-1", "user-1");
  });
});
