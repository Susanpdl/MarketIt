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
        <div className="flex justify-between items-center mb-6">
          <div className="skeleton h-8 w-44 rounded-xl" />
          <div className="skeleton h-10 w-36 rounded-xl" />
        </div>
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <h1 className="text-2xl font-normal m-0 text-primary tracking-tight">Influencers</h1>
        <button className="btn btn-primary btn-interactive" onClick={() => setShowAdd(true)}>
          + Add influencer
        </button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="search"
          className="input max-w-[320px]"
          placeholder="Search by name, handle, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input w-auto min-w-[140px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
