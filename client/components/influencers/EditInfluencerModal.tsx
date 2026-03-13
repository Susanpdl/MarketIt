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
      <div className="card card-elevated" style={{ maxWidth: 420, width: "90%", margin: "1rem" }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: "1.25rem", fontSize: "1.25rem" }}>Edit influencer</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div>
            <label className="label">Name *</label>
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
          {error && <p style={{ color: "var(--error)", fontSize: "0.9rem" }}>{error}</p>}
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
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
