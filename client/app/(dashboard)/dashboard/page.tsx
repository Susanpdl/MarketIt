"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ViewEmailModal } from "@/components/influencers/ViewEmailModal";

type DashboardStats = {
  totalInfluencers: number;
  byStatus: { active: number; waiting: number; success: number; failure: number };
  successRate: number;
  totalSales: number;
  recentSales: { amount: number; date: string }[];
  recentInfluencers: { id: string; name: string; status: string; addedAt: string }[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewEmailFor, setViewEmailFor] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_URL}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("Failed")))
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div style={{ marginBottom: "2rem" }}>
          <div className="skeleton" style={{ height: 32, width: 200, marginBottom: "0.5rem" }} />
          <div className="skeleton" style={{ height: 20, width: 320 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card" style={{ padding: "1.5rem" }}>
              <div className="skeleton" style={{ height: 20, width: "60%", marginBottom: "0.5rem" }} />
              <div className="skeleton" style={{ height: 36, width: "40%" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const s = stats!;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 600, margin: 0 }}>Dashboard</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem", fontSize: "0.9375rem" }}>
          Overview of your influencer campaigns and sales performance
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard
          title="Total Influencers"
          value={s.totalInfluencers}
          icon="👥"
          href="/influencers"
        />
        <StatCard
          title="Total Sales"
          value={`$${s.totalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon="💰"
          href="/growth"
        />
        <StatCard
          title="Success Rate"
          value={`${s.successRate}%`}
          suffix={s.byStatus.success + s.byStatus.failure > 0 ? ` of ${s.byStatus.success + s.byStatus.failure} completed` : ""}
          icon="📈"
        />
        <StatCard
          title="Active Now"
          value={s.byStatus.active}
          suffix={s.byStatus.waiting > 0 ? ` + ${s.byStatus.waiting} waiting` : ""}
          icon="⚡"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        <div className="card card-elevated" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Recent Sales</span>
            <Link href="/growth" style={{ marginLeft: "auto", fontSize: "0.875rem", fontWeight: 400 }}>View all</Link>
          </h2>
          {s.recentSales.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No sales yet. Add records from the Growth page.</p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {s.recentSales.map((r, i) => (
                <li key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{r.date}</span>
                  <span style={{ fontWeight: 600, color: "var(--success)" }}>${r.amount.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card card-elevated" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Recent Influencers</span>
            <Link href="/influencers" style={{ marginLeft: "auto", fontSize: "0.875rem", fontWeight: 400 }}>View all</Link>
          </h2>
          {s.recentInfluencers.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No influencers yet. Add your first from the Influencers page.</p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {s.recentInfluencers.map((r) => (
                <li key={r.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
                  <Link href={`/analytics/${r.id}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", color: "inherit", flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 500 }}>{r.name}</span>
                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                  </Link>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setViewEmailFor({ id: r.id, name: r.name })}>
                    View email
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {viewEmailFor && (
        <ViewEmailModal
          influencerId={viewEmailFor.id}
          influencerName={viewEmailFor.name}
          onClose={() => setViewEmailFor(null)}
        />
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  suffix,
  icon,
  href,
}: {
  title: string;
  value: string | number;
  suffix?: string;
  icon: string;
  href?: string;
}) {
  const content = (
    <div className="card card-elevated" style={{ padding: "1.25rem", transition: "transform 0.2s" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 500 }}>{title}</span>
        <span style={{ fontSize: "1.5rem" }}>{icon}</span>
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
      {suffix && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{suffix}</div>}
    </div>
  );
  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
        {content}
      </Link>
    );
  }
  return content;
}
