"use client";

import { useState } from "react";
import Link from "next/link";

type Influencer = {
  id: string;
  name: string;
  instagramHandle?: string | null;
  email?: string | null;
  status: string;
  addedAt: string;
  posts: { id: string }[];
};

const statusLabel: Record<string, string> = {
  active: "Active",
  waiting: "Waiting",
  success: "Success",
  failure: "Failure",
};

const statusClass: Record<string, string> = {
  active: "badge-active",
  waiting: "badge-waiting",
  success: "badge-success",
  failure: "badge-failure",
};

export function InfluencerCard({ influencer, onStatusChange }: { influencer: Influencer; onStatusChange?: () => void }) {
  const [status, setStatus] = useState(influencer.status);
  const [updating, setUpdating] = useState(false);

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/influencers/${influencer.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus(newStatus);
      onStatusChange?.();
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <strong>{influencer.name}</strong>
          {influencer.instagramHandle && (
            <span style={{ color: "#888", marginLeft: "0.5rem" }}>@{influencer.instagramHandle}</span>
          )}
        </div>
        <select
          value={status}
          onChange={handleStatusChange}
          disabled={updating}
          className="input"
          style={{ width: "auto", padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}
        >
          <option value="waiting">Waiting</option>
          <option value="active">Active</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </select>
      </div>
      {influencer.email && <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem", color: "#888" }}>{influencer.email}</p>}
      <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "#666" }}>
        Added {new Date(influencer.addedAt).toLocaleDateString()}
        {influencer.posts.length > 0 && ` • ${influencer.posts.length} post(s)`}
      </p>
      <Link
        href={`/analytics/${influencer.id}`}
        className="btn btn-secondary"
        style={{ marginTop: "0.75rem", display: "inline-block", fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
      >
        View analytics
      </Link>
    </div>
  );
}
