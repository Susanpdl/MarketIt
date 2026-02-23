"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Post = {
  id: string;
  postUrl?: string | null;
  postedAt?: string | null;
  stats?: { likes: number; comments: number; shares?: number | null; views?: number | null; fetchedAt: string } | null;
};

type Influencer = {
  id: string;
  name: string;
  instagramHandle?: string | null;
  posts: Post[];
};

const POLL_INTERVAL = 30_000; // 30 seconds for "real-time" feel

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<Influencer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddPost, setShowAddPost] = useState(false);

  async function fetchAnalytics() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/analytics/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) setData(await res.json());
      else if (res.status === 404) router.push("/influencers");
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const t = setInterval(fetchAnalytics, POLL_INTERVAL);
    return () => clearInterval(t);
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Influencer not found.</p>;

  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/influencers" style={{ color: "#7c8aff", fontSize: "0.9rem" }}>
          ← Back to influencers
        </Link>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>
          Analytics: {data.name}
          {data.instagramHandle && <span style={{ color: "#888", fontWeight: 400 }}> @{data.instagramHandle}</span>}
        </h1>
        <button className="btn" onClick={() => setShowAddPost(true)}>
          + Add post
        </button>
      </div>
      <p style={{ color: "#888", marginBottom: "1rem" }}>Post interactions (refreshes every 30s)</p>
      {data.posts.length === 0 ? (
        <div className="card">
          <p>No posts yet. Add a post when the influencer publishes.</p>
          <button className="btn" onClick={() => setShowAddPost(true)}>
            Add first post
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {data.posts.map((post) => (
            <div key={post.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
                <div>
                  <strong>Post</strong>
                  {post.postedAt && (
                    <span style={{ color: "#888", marginLeft: "0.5rem" }}>
                      {new Date(post.postedAt).toLocaleDateString()}
                    </span>
                  )}
                  {post.postUrl && (
                    <div style={{ marginTop: "0.25rem" }}>
                      <a href={post.postUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.9rem" }}>
                        View on Instagram
                      </a>
                    </div>
                  )}
                </div>
                {post.stats && (
                  <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                    <span>❤️ {post.stats.likes}</span>
                    <span>💬 {post.stats.comments}</span>
                    {post.stats.views != null && <span>👁 {post.stats.views}</span>}
                    {post.stats.shares != null && <span>↗ {post.stats.shares}</span>}
                  </div>
                )}
              </div>
              <div style={{ marginTop: "0.5rem" }}>
                <EditStatsButton postId={post.id} initial={post.stats} onUpdated={fetchAnalytics} />
              </div>
            </div>
          ))}
        </div>
      )}
      {showAddPost && (
        <AddPostModal
          influencerId={id}
          onClose={() => setShowAddPost(false)}
          onAdded={fetchAnalytics}
        />
      )}
    </>
  );
}

function EditStatsButton({
  postId,
  initial,
  onUpdated,
}: {
  postId: string;
  initial?: { likes: number; comments: number; shares?: number | null; views?: number | null } | null;
  onUpdated: () => void;
}) {
  const [show, setShow] = useState(false);
  const [likes, setLikes] = useState(initial?.likes ?? 0);
  const [comments, setComments] = useState(initial?.comments ?? 0);
  const [shares, setShares] = useState(initial?.shares ?? 0);
  const [views, setViews] = useState(initial?.views ?? 0);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/analytics/post/${postId}/stats`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ likes, comments, shares: shares || undefined, views: views || undefined }),
        }
      );
      if (!res.ok) throw new Error("Failed");
      onUpdated();
      setShow(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }} onClick={() => setShow(true)}>
        {initial ? "Edit stats" : "Add stats"}
      </button>
      {show && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 101,
          }}
          onClick={() => setShow(false)}
        >
          <div className="card" style={{ maxWidth: 320 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "0.75rem" }}>Post stats</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div>
                <label className="label">Likes</label>
                <input type="number" className="input" min={0} value={likes} onChange={(e) => setLikes(Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Comments</label>
                <input type="number" className="input" min={0} value={comments} onChange={(e) => setComments(Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Views</label>
                <input type="number" className="input" min={0} value={views} onChange={(e) => setViews(Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Shares</label>
                <input type="number" className="input" min={0} value={shares} onChange={(e) => setShares(Number(e.target.value))} />
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="submit" className="btn" disabled={loading}>Save</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function AddPostModal({
  influencerId,
  onClose,
  onAdded,
}: {
  influencerId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [postUrl, setPostUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/influencers/${influencerId}/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ postUrl: postUrl || undefined }),
        }
      );
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      onAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div className="card" style={{ maxWidth: 400, margin: "1rem" }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: "1rem" }}>Add post</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <label className="label">Post URL (optional)</label>
            <input
              className="input"
              placeholder="https://instagram.com/p/..."
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
            />
          </div>
          {error && <p style={{ color: "#f87171", fontSize: "0.9rem" }}>{error}</p>}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Adding..." : "Add"}
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
