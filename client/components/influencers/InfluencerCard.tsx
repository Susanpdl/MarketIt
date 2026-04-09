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
    <div className="card animate-slide-up mb-4 transition-all hover-scale-sm">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <strong className="text-105 font-normal tracking-tight">{influencer.name}</strong>
          {influencer.instagramHandle && (
            <span className="text-secondary ml-2">@{influencer.instagramHandle}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={handleStatusChange}
            disabled={updating}
            className="input w-auto py-2 px-3 text-sm min-w-110"
          >
            <option value="waiting">Waiting</option>
            <option value="active">Active</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
          </select>
          <button
            type="button"
            className="btn btn-ghost btn-icon p-2 btn-interactive-sm"
            onClick={() => setShowEmailModal(true)}
            title="View email"
          >
            ✉️
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-icon p-2 btn-interactive-sm"
            onClick={() => setShowEditModal(true)}
            title="Edit influencer"
          >
            ✏️
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-icon btn-danger p-2 btn-interactive-sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            title="Delete influencer"
          >
            🗑
          </button>
        </div>
      </div>
      {showDeleteConfirm && (
        <div className="mt-4 p-4 bg-error-muted rounded-lg flex items-center justify-between gap-2 flex-wrap shadow-clay-inset">
          <span className="text-sm text-error">Delete this influencer?</span>
          <div className="flex gap-2">
            <button type="button" className="btn btn-sm btn-danger btn-interactive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </button>
            <button type="button" className="btn btn-sm btn-secondary btn-interactive" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-error text-sm mt-2">{error}</p>}
      {influencer.email && <p className="mt-1 text-sm text-secondary">{influencer.email}</p>}
      <p className="mt-2 text-85 text-muted">
        Added {new Date(influencer.addedAt).toLocaleDateString()}
        {influencer.posts.length > 0 && ` • ${influencer.posts.length} post(s)`}
      </p>
      <div className="flex gap-2 mt-4 flex-wrap">
        <button type="button" className="btn btn-ghost btn-sm btn-interactive" onClick={() => setShowEmailModal(true)}>
          View email
        </button>
        <Link
          href={`/analytics/${influencer.id}`}
          className="btn btn-secondary btn-sm inline-flex text-sm btn-interactive"
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
