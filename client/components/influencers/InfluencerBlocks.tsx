"use client";

import { InfluencerCard } from "./InfluencerCard";

type Influencer = {
  id: string;
  name: string;
  instagramHandle?: string | null;
  email?: string | null;
  status: string;
  addedAt: string;
  posts: { id: string }[];
};

const blocks = [
  { id: "active", title: "Current influencers", desc: "Replied and in the loop" },
  { id: "waiting", title: "Waiting for reply", desc: "Awaiting response" },
  { id: "success", title: "Past influencers (Success)", desc: "Posted as requested" },
  { id: "failure", title: "Past influencers (Failure)", desc: "Did not reach out or broke" },
];

export function InfluencerBlocks({ influencers, refetch }: { influencers: Influencer[]; refetch: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {blocks.map((block) => {
        const list = influencers.filter((i) => i.status === block.id);
        return (
          <section key={block.id}>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>{block.title}</h2>
            <p style={{ fontSize: "0.9rem", color: "#888", marginBottom: "0.75rem" }}>{block.desc}</p>
            {list.length === 0 ? (
              <p style={{ color: "#666", fontSize: "0.9rem" }}>None</p>
            ) : (
              list.map((inf) => <InfluencerCard key={inf.id} influencer={inf} onStatusChange={refetch} />)
            )}
          </section>
        );
      })}
    </div>
  );
}
