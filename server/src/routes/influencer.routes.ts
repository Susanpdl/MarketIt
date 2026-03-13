import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import * as influencerService from "../services/influencer.service.js";
import { notifyN8nInfluencerCreated } from "../lib/n8n.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const list = await influencerService.listByUser(userId);
    res.json(list);
  } catch (e) {
    console.error("GET /influencers error:", e);
    res.status(500).json({ error: "Failed to fetch influencers" });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { name, instagramHandle, email, notes } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });
    const inf = await influencerService.create(userId, {
      name,
      instagramHandle,
      email,
      notes,
    });
    if (email) {
      notifyN8nInfluencerCreated({
        influencerId: inf.id,
        name: inf.name,
        email: inf.email,
        instagramHandle: inf.instagramHandle,
        notes: inf.notes ?? undefined,
      }).catch(() => {});
    }
    res.status(201).json(inf);
  } catch (e) {
    console.error("POST /influencers error:", e);
    res.status(500).json({ error: "Failed to add influencer" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const inf = await influencerService.getById(req.params.id, userId);
    res.json(inf);
  } catch (e) {
    console.error("GET /influencers/:id error:", e);
    res.status(404).json({ error: "Influencer not found" });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { status } = req.body;
    const valid = ["active", "waiting", "success", "failure"];
    if (!status || !valid.includes(status)) return res.status(400).json({ error: "Invalid status" });
    await influencerService.updateStatus(req.params.id, userId, status as influencerService.InfluencerStatus);
    const inf = await influencerService.getById(req.params.id, userId);
    res.json(inf);
  } catch (e) {
    console.error("PATCH /influencers/:id/status error:", e);
    res.status(400).json({ error: e instanceof Error ? e.message : "Update failed" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { name, instagramHandle, email, notes } = req.body;
    await influencerService.update(req.params.id, userId, { name, instagramHandle, email, notes });
    const inf = await influencerService.getById(req.params.id, userId);
    res.json(inf);
  } catch (e) {
    console.error("PATCH /influencers/:id error:", e);
    res.status(400).json({ error: "Update failed" });
  }
});

router.post("/:id/posts", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { postUrl } = req.body;
    const post = await influencerService.addPost(req.params.id, userId, postUrl);
    res.status(201).json(post);
  } catch (e) {
    console.error("POST /influencers/:id/posts error:", e);
    res.status(400).json({ error: e instanceof Error ? e.message : "Failed to add post" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user!.userId;
    await influencerService.remove(req.params.id, userId);
    res.status(204).send();
  } catch (e) {
    console.error("DELETE /influencers/:id error:", e);
    res.status(404).json({ error: e instanceof Error ? e.message : "Failed to delete influencer" });
  }
});

export { router as influencerRoutes };
