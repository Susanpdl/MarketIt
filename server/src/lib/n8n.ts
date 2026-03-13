/**
 * Notifies n8n when an influencer is created so it can send the outreach email.
 * n8n workflow should be configured with a Webhook trigger listening for this payload.
 */
export async function notifyN8nInfluencerCreated(payload: {
  influencerId: string;
  name: string;
  email?: string | null;
  instagramHandle?: string | null;
  notes?: string | null;
}) {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) {
    console.warn("N8N_WEBHOOK_URL not set - skipping n8n notification");
    return;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "influencer.created",
        ...payload,
      }),
    });
    if (!res.ok) {
      console.error("n8n webhook failed:", res.status, await res.text());
    }
  } catch (e) {
    console.error("n8n webhook error:", e);
  }
}
