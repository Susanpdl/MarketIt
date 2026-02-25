import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import * as authService from "../services/auth.service.js";

vi.mock("../services/auth.service.js");

describe("Auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("returns 400 when email and password are missing", async () => {
      const res = await request(app).post("/api/auth/register").send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email and password required");
    });

    it("returns 400 when email is missing", async () => {
      const res = await request(app).post("/api/auth/register").send({ password: "secret123" });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email and password required");
    });

    it("returns 400 when password is missing", async () => {
      const res = await request(app).post("/api/auth/register").send({ email: "test@test.com" });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email and password required");
    });

    it("returns 200 with user and token on success", async () => {
      const mockUser = { id: "user-1", email: "test@test.com", name: "Test" };
      vi.mocked(authService.register).mockResolvedValue({
        user: mockUser,
        token: "fake-jwt-token",
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@test.com", password: "secret123", name: "Test" });

      expect(res.status).toBe(200);
      expect(res.body.user).toEqual(mockUser);
      expect(res.body.token).toBe("fake-jwt-token");
      expect(authService.register).toHaveBeenCalledWith("test@test.com", "secret123", "Test");
    });

    it("returns 400 when service throws", async () => {
      vi.mocked(authService.register).mockRejectedValue(new Error("Email already registered"));

      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "exists@test.com", password: "secret123" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email already registered");
    });
  });

  describe("POST /api/auth/login", () => {
    it("returns 400 when email and password are missing", async () => {
      const res = await request(app).post("/api/auth/login").send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email and password required");
    });

    it("returns 401 with user and token on success", async () => {
      const mockUser = { id: "user-1", email: "test@test.com", name: "Test" };
      vi.mocked(authService.login).mockResolvedValue({
        user: mockUser,
        token: "fake-jwt-token",
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@test.com", password: "secret123" });

      expect(res.status).toBe(200);
      expect(res.body.user).toEqual(mockUser);
      expect(res.body.token).toBe("fake-jwt-token");
    });

    it("returns 401 when credentials are invalid", async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error("Invalid credentials"));

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "wrong@test.com", password: "wrong" });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid credentials");
    });
  });
});
