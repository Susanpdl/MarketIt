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
      <div className="center min-h-screen bg-[#f5f5f7]">
        <div className="flex flex-col items-center gap-4">
          <div className="skeleton w-16 h-16 rounded-2xl" />
          <div className="skeleton w-40 h-6 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center p-8 text-center">
      <div className="animate-slide-up max-w-[520px]">
        <div className="text-5xl mb-4">📦</div>
        <h1 className="text-4xl font-bold m-0 tracking-tight leading-tight text-primary">
          MarketIt
        </h1>
        <p className="text-secondary text-lg mt-3 leading-relaxed">
          Track your influencer campaigns, measure growth, and see which partnerships drive real results.
        </p>
        <div className="flex gap-4 mt-8 justify-center flex-wrap">
          <Link href="/login" className="btn btn-primary py-3 px-6 text-base btn-interactive">
            Log in
          </Link>
          <Link href="/register" className="btn btn-secondary py-3 px-6 text-base btn-interactive">
            Sign up free
          </Link>
        </div>
        <div className="flex gap-8 mt-12 justify-center flex-wrap text-muted text-sm">
          <span>👥 Manage influencers</span>
          <span>📈 Track sales growth</span>
          <span>📊 View analytics</span>
        </div>
      </div>
    </div>
  );
}
