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
    <div className="flex flex-col gap-8">
      {blocks.map((block) => {
        const list = influencers.filter((i) => i.status === block.id);
        return (
          <section key={block.id}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{block.icon}</span>
              <h2 className="text-lg font-normal tracking-tight m-0">{block.title}</h2>
              {list.length > 0 && (
                <span className="badge ml-2 bg-elevated text-secondary text-xs tnum">
                  {list.length}
                </span>
              )}
            </div>
            <p className="text-sm text-muted mb-3">{block.desc}</p>
            {list.length === 0 ? (
              <p className="text-muted text-sm">None</p>
            ) : (
              list.map((inf) => <InfluencerCard key={inf.id} influencer={inf} onStatusChange={refetch} onDelete={refetch} onEdit={refetch} />)
            )}
          </section>
        );
      })}
    </div>
  );
}
