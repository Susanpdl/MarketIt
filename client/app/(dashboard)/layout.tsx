"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [user, loading]);

  if (loading || !user) return <div className="center">Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid #2a2b33",
          background: "#1a1b22",
        }}
      >
        <Link href="/influencers" style={{ fontSize: "1.25rem", fontWeight: 600, color: "inherit", textDecoration: "none" }}>
          MarketIt
        </Link>
        <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <Link
            href="/influencers"
            style={{ color: pathname === "/influencers" ? "#7c8aff" : "#a0a0a5", textDecoration: "none" }}
          >
            Influencers
          </Link>
          <Link
            href="/growth"
            style={{ color: pathname === "/growth" ? "#7c8aff" : "#a0a0a5", textDecoration: "none" }}
          >
            Growth
          </Link>
          <span style={{ color: "#666", fontSize: "0.9rem" }}>{user.email}</span>
          <button
            onClick={logout}
            style={{
              background: "none",
              border: "none",
              color: "#a0a0a5",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Log out
          </button>
        </nav>
      </header>
      <main style={{ flex: 1, padding: "1.5rem", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        {children}
      </main>
    </div>
  );
}
