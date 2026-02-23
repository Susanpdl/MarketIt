"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import Link from "next/link";

type SalesPoint = { date: string; amount: number; notes?: string | null };
type Marker = { date: string; influencerName: string; postUrl?: string };

export default function GrowthPage() {
  const [sales, setSales] = useState<SalesPoint[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  async function fetchData() {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [salesRes, markersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/growth/sales`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/growth/markers`, { headers }),
      ]);
      if (salesRes.ok) setSales(await salesRes.json());
      if (markersRes.ok) setMarkers(await markersRes.json());
    } catch {
      setSales([]);
      setMarkers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  const chartData = sales.map((s) => ({ ...s, amount: Number(s.amount) }));

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Growth</h1>
        <button className="btn" onClick={() => setShowAdd(true)}>
          + Add sales record
        </button>
      </div>
      <p style={{ color: "#888", marginBottom: "1rem" }}>
        Sales over time. Markers show when success influencers posted.
      </p>
      {chartData.length === 0 ? (
        <div className="card">
          <p>No sales data yet. Add a sales record to see the growth chart.</p>
          <button className="btn" onClick={() => setShowAdd(true)}>
            Add first record
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2b33" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "#1a1b22", border: "1px solid #2a2b33", borderRadius: 8 }}
                  labelStyle={{ color: "#e8e8ea" }}
                />
                <Line type="monotone" dataKey="amount" stroke="#7c8aff" strokeWidth={2} dot={{ fill: "#7c8aff" }} />
                {markers.map((m) => (
                  <ReferenceLine
                    key={m.date + m.influencerName}
                    x={m.date}
                    stroke="#4ade80"
                    strokeDasharray="3 3"
                    label={{ value: m.influencerName, position: "top", fill: "#4ade80", fontSize: 10 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {markers.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: "0.75rem" }}>Success markers</h3>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#888" }}>
            {markers.map((m) => (
              <li key={m.date + m.influencerName} style={{ marginBottom: "0.25rem" }}>
                {m.date}: {m.influencerName}
                {m.postUrl && (
                  <a href={m.postUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "0.5rem", fontSize: "0.85rem" }}>
                    View post
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {showAdd && (
        <AddSalesModal onClose={() => setShowAdd(false)} onAdded={fetchData} />
      )}
    </>
  );
}

function AddSalesModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ amount: Number(amount), date, notes: notes || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      onAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div className="card" style={{ maxWidth: 400, margin: "1rem" }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: "1rem" }}>Add sales record</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <label className="label">Amount</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          {error && <p style={{ color: "#f87171", fontSize: "0.9rem" }}>{error}</p>}
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
