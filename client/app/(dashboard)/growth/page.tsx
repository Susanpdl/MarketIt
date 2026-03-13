"use client";

import { useState, useEffect, useCallback } from "react";
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
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

type SalesRecord = { id: string; amount: string; date: string; notes?: string | null };
type SalesPoint = { date: string; amount: number; notes?: string | null };
type Marker = { date: string; influencerName: string; postUrl?: string };

export default function GrowthPage() {
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [salesRes, markersRes] = await Promise.all([
        apiGet<SalesRecord[]>("/api/sales"),
        apiGet<Marker[]>("/api/growth/markers"),
      ]);
      setSalesRecords(salesRes || []);
      setMarkers(markersRes || []);
    } catch {
      setSalesRecords([]);
      setMarkers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData: SalesPoint[] = salesRecords
    .map((r) => ({ date: r.date.slice(0, 10), amount: Number(r.amount), notes: r.notes }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="skeleton" style={{ height: 32, width: 120, marginBottom: "1rem" }} />
        <div className="skeleton" style={{ height: 300, borderRadius: "var(--radius-lg)" }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", margin: 0, fontWeight: 600 }}>Growth</h1>
        <button className="btn" onClick={() => setShowAdd(true)}>
          + Add sales record
        </button>
      </div>
      <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9375rem" }}>
        Sales over time. Green markers show when successful influencers posted.
      </p>

      {chartData.length === 0 ? (
        <div className="card card-elevated" style={{ padding: "2rem", textAlign: "center", marginBottom: "1.5rem" }}>
          <p style={{ color: "var(--text-secondary)", margin: "0 0 1rem" }}>No sales data yet. Add a record to see the growth chart.</p>
          <button className="btn" onClick={() => setShowAdd(true)}>
            Add first record
          </button>
        </div>
      ) : (
        <div className="card card-elevated" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)" }}
                  labelStyle={{ color: "var(--text-primary)" }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]}
                />
                <Line type="monotone" dataKey="amount" stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--accent)" }} />
                {markers.map((m) => (
                  <ReferenceLine
                    key={m.date + m.influencerName}
                    x={m.date}
                    stroke="var(--success)"
                    strokeDasharray="3 3"
                    label={{ value: m.influencerName, position: "top", fill: "var(--success)", fontSize: 10 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {markers.length > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "0.75rem", fontSize: "1rem" }}>Success markers</h3>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
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

      {salesRecords.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Sales records</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {salesRecords.map((r) => (
              <SalesRecordRow key={r.id} record={r} onUpdate={fetchData} />
            ))}
          </div>
        </div>
      )}

      {showAdd && <AddSalesModal onClose={() => setShowAdd(false)} onAdded={fetchData} />}
    </div>
  );
}

function SalesRecordRow({ record, onUpdate }: { record: SalesRecord; onUpdate: () => void }) {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(record.amount);
  const [date, setDate] = useState(record.date.slice(0, 10));
  const [notes, setNotes] = useState(record.notes || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await apiPatch(`/api/sales/${record.id}`, { amount: Number(amount), date, notes: notes || undefined });
      onUpdate();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiDelete(`/api/sales/${record.id}`);
      onUpdate();
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", padding: "0.75rem", background: "var(--bg-primary)", borderRadius: "var(--radius-md)" }}>
        <input type="number" step="0.01" className="input" style={{ width: 100 }} value={amount} onChange={(e) => setAmount(e.target.value)} />
        <input type="date" className="input" style={{ width: 140 }} value={date} onChange={(e) => setDate(e.target.value)} />
        <input className="input" style={{ flex: 1, minWidth: 120 }} placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button type="button" className="btn btn-sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "var(--bg-primary)", borderRadius: "var(--radius-md)", flexWrap: "wrap", gap: "0.5rem" }}>
      <div>
        <span style={{ fontWeight: 600, color: "var(--success)" }}>{"$" + Number(record.amount).toLocaleString()}</span>
        <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem", fontSize: "0.9rem" }}>{record.date.slice(0, 10)}</span>
        {record.notes && <span style={{ color: "var(--text-secondary)", marginLeft: "0.5rem", fontSize: "0.85rem" }}> - {record.notes}</span>}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
          Edit
        </button>
        {!showDeleteConfirm ? (
          <button type="button" className="btn btn-ghost btn-sm btn-danger" onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </button>
        ) : (
          <>
            <span style={{ fontSize: "0.85rem", color: "var(--error)" }}>Delete?</span>
            <button type="button" className="btn btn-sm btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "..." : "Yes"}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
              No
            </button>
          </>
        )}
      </div>
    </div>
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
      await apiPost("/api/sales", { amount: Number(amount), date, notes: notes || undefined });
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
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div className="card card-elevated" style={{ maxWidth: 400, width: "90%", margin: "1rem" }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: "1rem" }}>Add sales record</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <label className="label">Amount</label>
            <input type="number" step="0.01" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          {error && <p style={{ color: "var(--error)", fontSize: "0.9rem" }}>{error}</p>}
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
