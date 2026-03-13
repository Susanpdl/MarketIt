import { Router, Request, Response } from "express";
import * as influencerService from "../services/influencer.service.js";

const router = Router();

function n8nAuth(req: Request, res: Response, next: () => void) {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("N8N_WEBHOOK_SECRET not set - webhook auth disabled");
    return next();
  }
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (token !== secret) {
    return res.status(401).json({ error: "Invalid webhook secret" });
  }
  next();
}

/**
 * n8n calls this when it sends the outreach email (to store the actual email sent).
 * Body: { influencerId: string, emailContent: string }
 */
router.post("/n8n-email-sent", n8nAuth, async (req, res) => {
  try {
    const { influencerId, emailContent } = req.body;
    if (!influencerId || !emailContent) {
      return res.status(400).json({ error: "influencerId and emailContent required" });
    }
    await influencerService.setOutreachEmail(influencerId, emailContent);
    res.json({ ok: true });
  } catch (e) {
    console.error("webhook n8n-email-sent error:", e);
    res.status(400).json({ error: e instanceof Error ? e.message : "Update failed" });
  }
});

/**
 * n8n calls this when an influencer replies to the outreach email.
 * Body: { email: string, status?: "active", replyContent?: string }
 */
router.post("/n8n-influencer-reply", n8nAuth, async (req, res) => {
  try {
    const { email, status = "active", replyContent } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "email required" });
    }
    const valid = ["active", "waiting", "success", "failure"];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    await influencerService.updateStatusByEmail(
      email,
      status as influencerService.InfluencerStatus,
      typeof replyContent === "string" ? replyContent : undefined
    );
    res.json({ ok: true, message: "Influencer status updated" });
  } catch (e) {
    console.error("webhook n8n-influencer-reply error:", e);
    res.status(400).json({ error: e instanceof Error ? e.message : "Update failed" });
  }
});

export { router as webhookRoutes };
