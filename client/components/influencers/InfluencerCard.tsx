"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiPatch, apiDelete } from "@/lib/api";
import { EditInfluencerModal } from "./EditInfluencerModal";
import { ViewEmailModal } from "./ViewEmailModal";

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

export function InfluencerCard({ influencer, onStatusChange, onDelete, onEdit }: {
  influencer: Influencer;
  onStatusChange?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  const [status, setStatus] = useState(influencer.status);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    setStatus(influencer.status);
  }, [influencer.status]);

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    const prevStatus = status;
    setUpdating(true);
    setError("");
    setStatus(newStatus);
    try {
      await apiPatch(`/api/influencers/${influencer.id}/status`, { status: newStatus });
      onStatusChange?.();
    } catch (err) {
      setStatus(prevStatus);
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      await apiDelete(`/api/influencers/${influencer.id}`);
      onDelete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="card animate-slide-up" style={{ marginBottom: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <strong style={{ fontSize: "1.05rem" }}>{influencer.name}</strong>
          {influencer.instagramHandle && (
            <span style={{ color: "var(--text-secondary)", marginLeft: "0.5rem" }}>@{influencer.instagramHandle}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <select
            value={status}
            onChange={handleStatusChange}
            disabled={updating}
            className="input"
            style={{ width: "auto", padding: "0.35rem 0.6rem", fontSize: "0.8125rem", minWidth: 110 }}
          >
            <option value="waiting">Waiting</option>
            <option value="active">Active</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
          </select>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={() => setShowEmailModal(true)}
            title="View email"
            style={{ padding: "0.4rem" }}
          >
            ✉️
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={() => setShowEditModal(true)}
            title="Edit influencer"
            style={{ padding: "0.4rem" }}
          >
            ✏️
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-icon btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            title="Delete influencer"
            style={{ padding: "0.4rem" }}
          >
            🗑
          </button>
        </div>
      </div>
      {showDeleteConfirm && (
        <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "var(--error-muted)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--error)" }}>Delete this influencer?</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" className="btn btn-sm btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {error && <p style={{ color: "var(--error)", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>{error}</p>}
      {influencer.email && <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem", color: "var(--text-secondary)" }}>{influencer.email}</p>}
      <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
        Added {new Date(influencer.addedAt).toLocaleDateString()}
        {influencer.posts.length > 0 && ` • ${influencer.posts.length} post(s)`}
      </p>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowEmailModal(true)}>
          View email
        </button>
        <Link
          href={`/analytics/${influencer.id}`}
          className="btn btn-secondary btn-sm"
          style={{ display: "inline-flex", fontSize: "0.85rem" }}
        >
          View analytics →
        </Link>
      </div>
      {showEditModal && (
        <EditInfluencerModal
          influencer={influencer}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            onEdit?.();
            setShowEditModal(false);
          }}
        />
      )}
      {showEmailModal && (
        <ViewEmailModal
          influencerId={influencer.id}
          influencerName={influencer.name}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
}
