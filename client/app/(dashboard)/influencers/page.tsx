"use client";

import { useState, useEffect, useCallback } from "react";
import { InfluencerBlocks } from "@/components/influencers/InfluencerBlocks";
import { AddInfluencerModal } from "@/components/influencers/AddInfluencerModal";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchInfluencers = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/influencers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInfluencers(data);
      }
    } catch {
      setInfluencers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInfluencers();
  }, [fetchInfluencers]);

  const filtered = influencers.filter((i) => {
    const matchSearch =
      !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.instagramHandle?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (i.email?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div className="skeleton" style={{ height: 32, width: 180 }} />
          <div className="skeleton" style={{ height: 40, width: 140 }} />
        </div>
        <div className="skeleton" style={{ height: 200, borderRadius: "var(--radius-lg)" }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", margin: 0, fontWeight: 600 }}>Influencers</h1>
        <button className="btn" onClick={() => setShowAdd(true)}>
          + Add influencer
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          type="search"
          className="input"
          placeholder="Search by name, handle, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <select
          className="input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: "auto", minWidth: 140 }}
        >
          <option value="all">All statuses</option>
          <option value="waiting">Waiting</option>
          <option value="active">Active</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </select>
      </div>

      <InfluencerBlocks influencers={filtered} refetch={fetchInfluencers} />
      {showAdd && (
        <AddInfluencerModal onClose={() => setShowAdd(false)} onAdded={fetchInfluencers} />
      )}
    </div>
  );
}
