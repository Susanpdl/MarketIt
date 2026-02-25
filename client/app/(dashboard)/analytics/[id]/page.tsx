"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";

type PostStats = { likes: number; comments: number; shares?: number | null; views?: number | null; fetchedAt: string };
type Post = { id: string; postUrl?: string | null; postedAt?: string | null; stats: PostStats | null };
type InfluencerAnalytics = {
  id: string;
  name: string;
  instagramHandle?: string | null;
  email?: string | null;
  posts: Post[];
};

export default function AnalyticsPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<InfluencerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiGet<InfluencerAnalytics>(`/api/analytics/${id}`)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error || !data) {
    return (
      <div className="card">
        <p style={{ color: "#f87171", marginBottom: "1rem" }}>{error || "Influencer not found"}</p>
        <Link href="/influencers" className="btn btn-secondary">
          Back to Influencers
        </Link>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/influencers" style={{ color: "#888", fontSize: "0.9rem", marginBottom: "0.5rem", display: "inline-block" }}>
          ← Back to Influencers
        </Link>
        <h1 style={{ fontSize: "1.5rem", margin: "0.5rem 0 0" }}>
          Analytics: {data.name}
          {data.instagramHandle && (
            <span style={{ color: "#888", marginLeft: "0.5rem", fontWeight: 400 }}>@{data.instagramHandle}</span>
          )}
        </h1>
      </div>
      {data.posts.length === 0 ? (
        <div className="card">
          <p style={{ color: "#888", margin: 0 }}>No posts yet for this influencer.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {data.posts.map((post) => (
            <div key={post.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  {post.postUrl ? (
                    <a href={post.postUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500 }}>
                      View post
                    </a>
                  ) : (
                    <span style={{ color: "#888" }}>Post</span>
                  )}
                  {post.postedAt && (
                    <span style={{ color: "#666", marginLeft: "0.5rem", fontSize: "0.85rem" }}>
                      {new Date(post.postedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {post.stats && (
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.9rem", color: "#a0a0a5" }}>
                    <span>👍 {post.stats.likes}</span>
                    <span>💬 {post.stats.comments}</span>
                    {post.stats.shares != null && <span>🔁 {post.stats.shares}</span>}
                    {post.stats.views != null && <span>👁 {post.stats.views}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
