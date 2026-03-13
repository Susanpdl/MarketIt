"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/influencers", label: "Influencers", icon: "👥" },
  { href: "/growth", label: "Growth", icon: "📈" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="center" style={{ background: "var(--bg-primary)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "var(--radius-md)" }} />
          <div className="skeleton" style={{ width: 120, height: 20 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-primary)" }}>
      <aside
        style={{
          width: 260,
          minHeight: "100vh",
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-subtle)",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            fontSize: "1.35rem",
            fontWeight: 700,
            color: "inherit",
            textDecoration: "none",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>📦</span>
          MarketIt
        </Link>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                  background: isActive ? "var(--accent-muted)" : "transparent",
                  textDecoration: "none",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "0.9375rem",
                  transition: "all var(--transition-fast)",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div
          style={{
            padding: "1rem",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user.email}
          </span>
          <button
            onClick={logout}
            className="btn btn-ghost btn-sm"
            style={{ justifyContent: "flex-start", width: "100%" }}
          >
            Log out
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: "2rem", maxWidth: 1100, margin: "0 auto", width: "100%", overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}
