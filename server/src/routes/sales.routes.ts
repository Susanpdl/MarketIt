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
    console.error("GET /sales error:", e);
    res.status(500).json({ error: "Failed to fetch sales" });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { amount, date, notes } = req.body;
    if (amount == null || !date) return res.status(400).json({ error: "Amount and date required" });
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return res.status(400).json({ error: "Amount must be a valid number" });
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return res.status(400).json({ error: "Date must be a valid date" });
    const record = await salesService.create(userId, numAmount, parsedDate, notes);
    res.status(201).json(record);
  } catch (e) {
    console.error("POST /sales error:", e);
    res.status(500).json({ error: "Failed to add sales record" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { amount, date, notes } = req.body;
    const data: { amount?: number; date?: Date; notes?: string } = {};
    if (amount != null) {
      const num = Number(amount);
      if (isNaN(num)) return res.status(400).json({ error: "Amount must be a valid number" });
      data.amount = num;
    }
    if (date) {
      const d = new Date(date);
      if (isNaN(d.getTime())) return res.status(400).json({ error: "Date must be valid" });
      data.date = d;
    }
    if (notes !== undefined) data.notes = notes;
    const record = await salesService.update(req.params.id, userId, data);
    res.json(record);
  } catch (e) {
    console.error("PATCH /sales/:id error:", e);
    res.status(400).json({ error: e instanceof Error ? e.message : "Update failed" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user!.userId;
    await salesService.remove(req.params.id, userId);
    res.status(204).send();
  } catch (e) {
    console.error("DELETE /sales/:id error:", e);
    res.status(404).json({ error: e instanceof Error ? e.message : "Failed to delete" });
  }
});

export { router as salesRoutes };
