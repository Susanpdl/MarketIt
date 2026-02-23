import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import * as salesService from "../services/sales.service.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const list = await salesService.list(userId);
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch sales" });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { amount, date, notes } = req.body;
    if (amount == null || !date) return res.status(400).json({ error: "Amount and date required" });
    const record = await salesService.create(userId, Number(amount), new Date(date), notes);
    res.status(201).json(record);
  } catch (e) {
    res.status(500).json({ error: "Failed to add sales record" });
  }
});

export { router as salesRoutes };
