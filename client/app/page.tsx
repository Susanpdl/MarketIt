"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="center" style={{ background: "var(--bg-primary)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div className="skeleton" style={{ width: 64, height: 64, borderRadius: "var(--radius-lg)" }} />
          <div className="skeleton" style={{ width: 160, height: 24 }} />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div className="animate-slide-up" style={{ maxWidth: 520 }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>📦</div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          MarketIt
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem", marginTop: "0.75rem", lineHeight: 1.6 }}>
          Track your influencer campaigns, measure growth, and see which partnerships drive real results.
        </p>
        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" className="btn" style={{ padding: "0.75rem 1.5rem", fontSize: "1rem" }}>
            Log in
          </Link>
          <Link href="/register" className="btn btn-secondary" style={{ padding: "0.75rem 1.5rem", fontSize: "1rem" }}>
            Sign up free
          </Link>
        </div>
        <div style={{ display: "flex", gap: "2rem", marginTop: "3rem", justifyContent: "center", flexWrap: "wrap", color: "var(--text-muted)", fontSize: "0.9rem" }}>
          <span>👥 Manage influencers</span>
          <span>📈 Track sales growth</span>
          <span>📊 View analytics</span>
        </div>
      </div>
    </div>
  );
}
