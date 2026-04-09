"use client";

import { useState, useEffect } from "react";
import { apiPatch } from "@/lib/api";

type Influencer = {
  id: string;
  name: string;
  instagramHandle?: string | null;
  email?: string | null;
  notes?: string | null;
};

type Props = {
  influencer: Influencer;
  onClose: () => void;
  onSaved: () => void;
};

export function EditInfluencerModal({ influencer, onClose, onSaved }: Props) {
  const [name, setName] = useState(influencer.name);
  const [instagramHandle, setInstagramHandle] = useState(influencer.instagramHandle || "");
  const [email, setEmail] = useState(influencer.email || "");
  const [notes, setNotes] = useState(influencer.notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(influencer.name);
    setInstagramHandle(influencer.instagramHandle || "");
    setEmail(influencer.email || "");
    setNotes(influencer.notes || "");
  }, [influencer]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiPatch(`/api/influencers/${influencer.id}`, {
        name,
        instagramHandle: instagramHandle || undefined,
        email: email || undefined,
        notes: notes || undefined,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] transition-opacity duration-250"
      onClick={onClose}
    >
      <div className="card card-elevated max-w-[420px] w-90 m-4 p-6 rounded-xl shadow-clay-lg animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-5 text-xl font-normal tracking-tight">Edit influencer</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Instagram handle</label>
            <input className="input" placeholder="@username" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ resize: "vertical" }} />
          </div>
          {error && <p className="text-error text-sm">{error}</p>}
          <div className="flex gap-3 mt-2">
            <button type="submit" className="btn btn-primary btn-interactive" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
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
