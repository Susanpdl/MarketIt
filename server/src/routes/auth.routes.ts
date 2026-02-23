import { Router } from "express";
import * as authService from "../services/auth.service.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const result = await authService.register(email, password, name);
    res.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Registration failed";
    res.status(400).json({ error: msg });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const result = await authService.login(email, password);
    res.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Login failed";
    res.status(401).json({ error: msg });
  }
});

export { router as authRoutes };
