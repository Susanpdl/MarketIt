"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) return <div className="center">Loading...</div>;
  if (user) {
    window.location.href = "/influencers";
    return null;
  }

  return (
    <div className="center" style={{ flexDirection: "column", gap: "1.5rem" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 600 }}>MarketIt</h1>
      <p style={{ color: "#888" }}>Track your influencer campaigns</p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Link href="/login" className="btn">Log in</Link>
        <Link href="/register" className="btn btn-secondary">Sign up</Link>
      </div>
    </div>
  );
}
