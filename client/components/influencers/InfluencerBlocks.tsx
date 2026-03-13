"use client";

import { InfluencerCard } from "./InfluencerCard";

type Influencer = {
  id: string;
  name: string;
  instagramHandle?: string | null;
  email?: string | null;
  notes?: string | null;
  status: string;
  addedAt: string;
  posts: { id: string }[];
};

const blocks = [
  { id: "active", title: "Current influencers", desc: "Replied and in the loop", icon: "⚡" },
  { id: "waiting", title: "Waiting for reply", desc: "Awaiting response", icon: "⏳" },
  { id: "success", title: "Past influencers (Success)", desc: "Posted as requested", icon: "✅" },
  { id: "failure", title: "Past influencers (Failure)", desc: "Did not reach out or broke", icon: "❌" },
];

export function InfluencerBlocks({ influencers, refetch }: { influencers: Influencer[]; refetch: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {blocks.map((block) => {
        const list = influencers.filter((i) => i.status === block.id);
        return (
          <section key={block.id}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.1rem" }}>{block.icon}</span>
              <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 600 }}>{block.title}</h2>
              {list.length > 0 && (
                <span className="badge" style={{ marginLeft: "0.5rem", background: "var(--bg-elevated)", color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                  {list.length}
                </span>
              )}
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>{block.desc}</p>
            {list.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>None</p>
            ) : (
              list.map((inf) => <InfluencerCard key={inf.id} influencer={inf} onStatusChange={refetch} onDelete={refetch} onEdit={refetch} />)
            )}
          </section>
        );
      })}
    </div>
  );
}
