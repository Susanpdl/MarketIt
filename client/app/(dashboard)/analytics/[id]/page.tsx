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
        <div className="skeleton h-6 w-48 mb-4 rounded-xl" />
        <div className="skeleton h-28 rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card p-6">
        <p className="text-error mb-4">{error || "Influencer not found"}</p>
        <Link href="/influencers" className="btn btn-secondary btn-interactive">
          ← Back to Influencers
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
        <div>
          <Link href="/influencers" className="text-sm mb-2 inline-block link-secondary-to-accent">
            ← Back to Influencers
          </Link>
          <h1 className="text-2xl font-semibold mt-2 m-0">
            {data.name}
            {data.instagramHandle && (
              <span className="text-secondary ml-2 font-normal">@{data.instagramHandle}</span>
            )}
          </h1>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary btn-sm btn-interactive" onClick={() => setShowEmailModal(true)}>
            View email
          </button>
          <button className="btn btn-primary btn-sm btn-interactive" onClick={() => setShowAddPost(true)}>
            + Add post
          </button>
        </div>
      </div>

      {data.posts.length === 0 ? (
        <div className="card card-elevated p-8 text-center">
          <p className="text-secondary mb-4">No posts yet for this influencer.</p>
          <button className="btn btn-primary btn-interactive" onClick={() => setShowAddPost(true)}>
            Add first post
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
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
    <div className="card animate-slide-up transition-all hover-scale-sm">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          {post.postUrl ? (
            <a href={post.postUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-base link-accent">
              View post ↗
            </a>
          ) : (
            <span className="text-muted">Post</span>
          )}
          {post.postedAt && (
            <span className="text-muted ml-2 text-sm">
              {new Date(post.postedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        {!editing ? (
          <div className="flex items-center gap-4 text-sm text-secondary">
            <span>👍 {post.stats?.likes ?? 0}</span>
            <span>💬 {post.stats?.comments ?? 0}</span>
            {post.stats?.shares != null && <span>🔁 {post.stats.shares}</span>}
            {post.stats?.views != null && <span>👁 {post.stats.views}</span>}
            <button type="button" className="btn btn-ghost btn-sm btn-interactive" onClick={() => setEditing(true)}>
              Edit stats
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 items-center">
            <input type="number" min={0} className="input w-16" placeholder="Likes" value={likes || ""} onChange={(e) => setLikes(Number(e.target.value) || 0)} />
            <input type="number" min={0} className="input w-16" placeholder="Comments" value={comments || ""} onChange={(e) => setComments(Number(e.target.value) || 0)} />
            <input type="number" min={0} className="input w-16" placeholder="Shares" value={shares || ""} onChange={(e) => setShares(Number(e.target.value) || 0)} />
            <input type="number" min={0} className="input w-16" placeholder="Views" value={views || ""} onChange={(e) => setViews(Number(e.target.value) || 0)} />
            <button type="button" className="btn btn-sm btn-primary btn-interactive" onClick={handleSaveStats} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" className="btn btn-secondary btn-sm btn-interactive" onClick={() => setEditing(false)}>
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
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] transition-opacity duration-250"
      onClick={onClose}
    >
      <div className="card card-elevated max-w-[400px] w-[90%] m-4 p-6 rounded-2xl shadow-clay-lg animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-semibold">Add post</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Post URL (optional)</label>
            <input className="input" type="url" placeholder="https://instagram.com/p/..." value={postUrl} onChange={(e) => setPostUrl(e.target.value)} />
          </div>
          {error && <p className="text-error text-sm">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary btn-interactive" disabled={loading}>
              {loading ? "Adding..." : "Add post"}
            </button>
            <button type="button" className="btn btn-secondary btn-interactive" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
