"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";

type Props = {
  onClose: () => void;
  onAdded: () => void;
};

export function AddInfluencerModal({ onClose, onAdded }: Props) {
  const [name, setName] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiPost("/api/influencers", {
        name,
        instagramHandle: instagramHandle || undefined,
        email: email || undefined,
        notes: notes || undefined,
      });
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
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] transition-opacity duration-250"
      onClick={onClose}
    >
      <div className="card card-elevated max-w-[420px] w-[90%] m-4 p-6 rounded-2xl shadow-clay-lg animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-5 text-xl font-semibold">Add influencer</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Name *</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Influencer name" />
          </div>
          <div>
            <label className="label">Instagram handle</label>
            <input className="input" placeholder="@username" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: "vertical" }}
              placeholder="Campaign details, deal terms, etc."
            />
          </div>
          {error && <p className="text-error text-sm">{error}</p>}
          <div className="flex gap-3 mt-2">
            <button type="submit" className="btn btn-primary btn-interactive" disabled={loading}>
              {loading ? "Adding..." : "Add influencer"}
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
