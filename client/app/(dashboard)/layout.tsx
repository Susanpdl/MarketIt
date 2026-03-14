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
      <div className="center min-h-screen bg-[#f5f5f7]">
        <div className="flex flex-col items-center gap-4">
          <div className="skeleton w-12 h-12 rounded-xl" />
          <div className="skeleton w-28 h-5 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f5f5f7]">
      <aside className="w-280 min-h-screen bg-white-80 backdrop-blur-sm py-6 px-5 flex flex-col rounded-r-3xl mr-4">
        <Link
          href="/dashboard"
          className="text-xl font-bold text-primary no-underline mb-8 flex items-center gap-2 transition-opacity"
        >
          <span className="text-2xl">📦</span>
          MarketIt
        </Link>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl no-underline text-9375 font-medium btn-interactive ${
                  isActive
                    ? "bg-[var(--accent-muted)] text-accent shadow-clay-inset"
                    : "text-secondary hover:bg-[var(--bg-hover)] hover:shadow-clay-sm"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="pt-6 border-t border-subtle flex flex-col gap-2">
          <span className="text-8125 text-muted truncate">{user.email}</span>
          <button onClick={logout} className="btn btn-ghost btn-sm justify-start w-full">
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 py-8 px-8 max-w-[1100px] mx-auto w-full overflow-auto">
        {children}
      </main>
    </div>
  );
}
