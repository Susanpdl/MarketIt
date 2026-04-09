"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, name || undefined);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card card-elevated animate-slide-up w-full max-w-[400px] p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">📦</span>
        <h1 className="text-2xl font-normal m-0 tracking-tight">Sign up</h1>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="label">Name (optional)</label>
          <input
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <span className="text-xs text-muted mt-1 block">At least 6 characters</span>
        </div>
        {error && <p className="text-error text-sm">{error}</p>}
        <button type="submit" className="btn btn-primary w-full py-3 btn-interactive" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>
      <p className="mt-6 text-sm text-secondary">
        Have an account? <Link href="/login" className="link-accent">Log in</Link>
      </p>
    </div>
  );
}
