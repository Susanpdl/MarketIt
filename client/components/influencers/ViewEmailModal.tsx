"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";

type InfluencerEmail = {
  id: string;
  name: string;
  email?: string | null;
  outreachEmailContent?: string | null;
  replyEmailContent?: string | null;
};

type Props = {
  influencerId: string;
  influencerName?: string;
  onClose: () => void;
};

export function ViewEmailModal({ influencerId, influencerName, onClose }: Props) {
  const [data, setData] = useState<InfluencerEmail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<InfluencerEmail>(`/api/influencers/${influencerId}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [influencerId]);

  const hasContent = data?.outreachEmailContent || data?.replyEmailContent;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="card card-elevated"
        style={{ maxWidth: 560, width: "90%", maxHeight: "85vh", margin: "1rem", display: "flex", flexDirection: "column", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Email - {data?.name ?? influencerName ?? "Influencer"}</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div style={{ overflow: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {loading ? (
            <div className="skeleton" style={{ height: 120, borderRadius: "var(--radius-md)" }} />
          ) : !hasContent ? (
            <p style={{ color: "var(--text-muted)", margin: 0 }}>
              {data?.email
                ? "No email content stored yet. The outreach email will appear here once sent via n8n."
                : "No email address for this influencer."}
            </p>
          ) : (
            <>
              {data.outreachEmailContent && (
                <div>
                  <h3 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.5rem", fontWeight: 600 }}>Outreach email</h3>
                  <pre
                    style={{
                      background: "var(--bg-primary)",
                      padding: "1rem",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.875rem",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      margin: 0,
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {data.outreachEmailContent}
                  </pre>
                </div>
              )}
              {data.replyEmailContent && (
                <div>
                  <h3 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.5rem", fontWeight: 600 }}>Reply</h3>
                  <pre
                    style={{
                      background: "var(--bg-primary)",
                      padding: "1rem",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.875rem",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      margin: 0,
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {data.replyEmailContent}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
