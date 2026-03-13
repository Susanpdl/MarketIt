"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { ViewEmailModal } from "@/components/influencers/ViewEmailModal";

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
  const [showAddPost, setShowAddPost] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const fetchData = useCallback(() => {
    if (!id) return;
    apiGet<InfluencerAnalytics>(`/api/analytics/${id}`)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  if (loading && !data) {
    return (
      <div className="animate-fade-in">
        <div className="skeleton" style={{ height: 24, width: 200, marginBottom: "1rem" }} />
        <div className="skeleton" style={{ height: 120, borderRadius: "var(--radius-lg)" }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card">
        <p style={{ color: "var(--error)", marginBottom: "1rem" }}>{error || "Influencer not found"}</p>
        <Link href="/influencers" className="btn btn-secondary">
          ← Back to Influencers
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <Link href="/influencers" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "0.5rem", display: "inline-block" }}>
            ← Back to Influencers
          </Link>
          <h1 style={{ fontSize: "1.5rem", margin: "0.5rem 0 0", fontWeight: 600 }}>
            {data.name}
            {data.instagramHandle && (
              <span style={{ color: "var(--text-secondary)", marginLeft: "0.5rem", fontWeight: 400 }}>@{data.instagramHandle}</span>
            )}
          </h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowEmailModal(true)}>
            View email
          </button>
          <button className="btn btn-sm" onClick={() => setShowAddPost(true)}>
            + Add post
          </button>
        </div>
      </div>

      {data.posts.length === 0 ? (
        <div className="card card-elevated" style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)", margin: "0 0 1rem" }}>No posts yet for this influencer.</p>
          <button className="btn" onClick={() => setShowAddPost(true)}>
            Add first post
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {data.posts.map((post) => (
            <PostCard key={post.id} post={post} influencerId={id} onUpdate={fetchData} />
          ))}
        </div>
      )}

      {showAddPost && (
        <AddPostModal
          influencerId={id}
          onClose={() => setShowAddPost(false)}
          onAdded={() => {
            fetchData();
            setShowAddPost(false);
          }}
        />
      )}
      {showEmailModal && (
        <ViewEmailModal
          influencerId={id}
          influencerName={data.name}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
}

function PostCard({ post, influencerId, onUpdate }: { post: Post; influencerId: string; onUpdate: () => void }) {
  const [editing, setEditing] = useState(false);
  const [likes, setLikes] = useState(post.stats?.likes ?? 0);
  const [comments, setComments] = useState(post.stats?.comments ?? 0);
  const [shares, setShares] = useState(post.stats?.shares ?? 0);
  const [views, setViews] = useState(post.stats?.views ?? 0);
  const [saving, setSaving] = useState(false);

  async function handleSaveStats() {
    setSaving(true);
    try {
      await apiPut(`/api/analytics/post/${post.id}/stats`, { likes, comments, shares: shares || undefined, views: views || undefined });
      onUpdate();
      setEditing(false);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card animate-slide-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          {post.postUrl ? (
            <a href={post.postUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500, fontSize: "1rem" }}>
              View post ↗
            </a>
          ) : (
            <span style={{ color: "var(--text-muted)" }}>Post</span>
          )}
          {post.postedAt && (
            <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem", fontSize: "0.85rem" }}>
              {new Date(post.postedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        {!editing ? (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            <span>👍 {post.stats?.likes ?? 0}</span>
            <span>💬 {post.stats?.comments ?? 0}</span>
            {post.stats?.shares != null && <span>🔁 {post.stats.shares}</span>}
            {post.stats?.views != null && <span>👁 {post.stats.views}</span>}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
              Edit stats
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            <input type="number" min={0} className="input" style={{ width: 70 }} placeholder="Likes" value={likes || ""} onChange={(e) => setLikes(Number(e.target.value) || 0)} />
            <input type="number" min={0} className="input" style={{ width: 70 }} placeholder="Comments" value={comments || ""} onChange={(e) => setComments(Number(e.target.value) || 0)} />
            <input type="number" min={0} className="input" style={{ width: 70 }} placeholder="Shares" value={shares || ""} onChange={(e) => setShares(Number(e.target.value) || 0)} />
            <input type="number" min={0} className="input" style={{ width: 70 }} placeholder="Views" value={views || ""} onChange={(e) => setViews(Number(e.target.value) || 0)} />
            <button type="button" className="btn btn-sm" onClick={handleSaveStats} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AddPostModal({ influencerId, onClose, onAdded }: { influencerId: string; onClose: () => void; onAdded: () => void }) {
  const [postUrl, setPostUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiPost(`/api/influencers/${influencerId}/posts`, { postUrl: postUrl || undefined });
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add post");
    } finally {
      setLoading(false);
    }
  }

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
      <div className="card card-elevated" style={{ maxWidth: 400, width: "90%", margin: "1rem" }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: "1rem" }}>Add post</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <label className="label">Post URL (optional)</label>
            <input className="input" type="url" placeholder="https://instagram.com/p/..." value={postUrl} onChange={(e) => setPostUrl(e.target.value)} />
          </div>
          {error && <p style={{ color: "var(--error)", fontSize: "0.9rem" }}>{error}</p>}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Adding..." : "Add post"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
