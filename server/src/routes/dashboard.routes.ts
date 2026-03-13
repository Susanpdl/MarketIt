import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import * as dashboardService from "../services/dashboard.service.js";

const router = Router();
router.use(authMiddleware);

router.get("/stats", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const stats = await dashboardService.getDashboardStats(userId);
    res.json(stats);
  } catch (e) {
    console.error("GET /dashboard/stats error:", e);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

export { router as dashboardRoutes };
