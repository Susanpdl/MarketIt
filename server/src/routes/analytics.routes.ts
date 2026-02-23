import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import * as analyticsService from "../services/analytics.service.js";

const router = Router();
router.use(authMiddleware);

router.get("/:influencerId", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const data = await analyticsService.getInfluencerAnalytics(req.params.influencerId, userId);
    res.json(data);
  } catch (e) {
    res.status(404).json({ error: "Influencer not found" });
  }
});

router.put("/post/:postId/stats", async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { likes, comments, shares, views } = req.body;
    const data = await analyticsService.updatePostStats(req.params.postId, userId, {
      likes,
      comments,
      shares,
      views,
    });
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Update failed" });
  }
});

export { router as analyticsRoutes };
