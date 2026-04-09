import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import * as growthService from "../services/growth.service.js";

const router = Router();
router.use(authMiddleware);

router.get("/sales", async (req, res) => {
  try {
    const userId = req.user!.userId;
    let from: Date | undefined;
    let to: Date | undefined;
    if (req.query.from) {
      from = new Date(req.query.from as string);
      if (isNaN(from.getTime())) return res.status(400).json({ error: "Invalid 'from' date" });
    }
    if (req.query.to) {
      to = new Date(req.query.to as string);
      if (isNaN(to.getTime())) return res.status(400).json({ error: "Invalid 'to' date" });
    }
    const data = await growthService.getSalesOverTime(userId, from, to);
    res.json(data);
  } catch (e) {
    console.error("GET /growth/sales error:", e);
    res.status(500).json({ error: "Failed to fetch sales" });
  }
});

router.get("/markers", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const data = await growthService.getSuccessMarkers(userId);
    res.json(data);
  } catch (e) {
    console.error("GET /growth/markers error:", e);
    res.status(500).json({ error: "Failed to fetch markers" });
  }
});

export { router as growthRoutes };
