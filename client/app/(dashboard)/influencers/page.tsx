"use client";

import { useState, useEffect } from "react";
import { InfluencerBlocks } from "@/components/influencers/InfluencerBlocks";
import { AddInfluencerModal } from "@/components/influencers/AddInfluencerModal";

type Influencer = {
  id: string;
  name: string;
  instagramHandle?: string | null;
  email?: string | null;
  status: string;
  addedAt: string;
  posts: { id: string }[];
};

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  async function fetchInfluencers() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/influencers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
  }

  useEffect(() => {
    fetchInfluencers();
  }, []);

  if (loading) return <p>Loading influencers...</p>;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Influencers</h1>
        <button className="btn" onClick={() => setShowAdd(true)}>
          + Add influencer
        </button>
      </div>
      <InfluencerBlocks influencers={influencers} refetch={fetchInfluencers} />
      {showAdd && (
        <AddInfluencerModal
          onClose={() => setShowAdd(false)}
          onAdded={fetchInfluencers}
        />
      )}
    </>
  );
}
