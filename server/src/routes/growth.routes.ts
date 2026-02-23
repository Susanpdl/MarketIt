import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import * as growthService from "../services/growth.service.js";

const router = Router();
router.use(authMiddleware);

router.get("/sales", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;
    const data = await growthService.getSalesOverTime(userId, from, to);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch sales" });
  }
});

router.get("/markers", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const data = await growthService.getSuccessMarkers(userId);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch markers" });
  }
});

export { router as growthRoutes };
