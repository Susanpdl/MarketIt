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
        <div className="mb-8">
          <div className="skeleton h-8 w-48 mb-2 rounded-xl" />
          <div className="skeleton h-5 w-80 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-5 w-3/5 mb-2 rounded-lg" />
              <div className="skeleton h-9 w-2/5 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const s = stats!;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold m-0 text-primary">Dashboard</h1>
        <p className="text-secondary mt-1 text-[0.9375rem]">
          Overview of your influencer campaigns and sales performance
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card card-elevated p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>💰</span>
            <span>Recent Sales</span>
            <Link href="/growth" className="ml-auto text-sm font-normal link-accent">View all</Link>
          </h2>
          {s.recentSales.length === 0 ? (
            <p className="text-muted text-sm">No sales yet. Add records from the Growth page.</p>
          ) : (
            <ul className="m-0 p-0 list-none">
              {s.recentSales.map((r, i) => (
                <li key={i} className="flex justify-between items-center py-3 border-b border-subtle gap-2">
                  <span className="text-secondary text-sm flex items-center gap-2">
                    <span>📅</span>
                    {r.date}
                  </span>
                  <span className="font-semibold text-success flex items-center gap-1">
                    <span>💵</span>
                    ${r.amount.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card card-elevated p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>👥</span>
            <span>Recent Influencers</span>
            <Link href="/influencers" className="ml-auto text-sm font-normal link-accent">View all</Link>
          </h2>
          {s.recentInfluencers.length === 0 ? (
            <p className="text-muted text-sm">No influencers yet. Add your first from the Influencers page.</p>
          ) : (
            <ul className="m-0 p-0 list-none">
              {s.recentInfluencers.map((r) => (
                <li key={r.id} className="py-3 border-b border-subtle flex items-center justify-between gap-2 flex-wrap">
                  <Link href={`/analytics/${r.id}`} className="flex items-center gap-2 no-underline text-inherit flex-1 min-w-0">
                    <span>👤</span>
                    <span className="font-medium">{r.name}</span>
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
    <div className="card card-elevated p-5 transition-all duration-250">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-secondary font-medium">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-primary">{value}</div>
      {suffix && <div className="text-xs text-muted mt-1">{suffix}</div>}
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="no-underline text-inherit">
        {content}
      </Link>
    );
  }
  return content;
}
