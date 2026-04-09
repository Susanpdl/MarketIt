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
        <div className="skeleton h-8 w-28 mb-4 rounded-xl" />
        <div className="skeleton h-72 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <h1 className="text-2xl font-normal m-0 text-primary tracking-tight">Growth</h1>
        <button className="btn btn-primary btn-interactive" onClick={() => setShowAdd(true)}>
          + Add sales record
        </button>
      </div>
      <p className="text-secondary mb-6 text-9375">
        Sales over time. Green markers show when successful influencers posted.
      </p>

      {chartData.length === 0 ? (
        <div className="card card-elevated p-8 text-center mb-6">
          <p className="text-secondary mb-4">No sales data yet. Add a record to see the growth chart.</p>
          <button className="btn btn-primary btn-interactive" onClick={() => setShowAdd(true)}>
            Add first record
          </button>
        </div>
      ) : (
        <div className="card card-elevated p-6 mb-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tick={{ style: { fontVariantNumeric: "tabular-nums" } }} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tick={{ style: { fontVariantNumeric: "tabular-nums" } }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)" }}
                  labelStyle={{ color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}
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
        <div className="card mb-6">
          <h3 className="mb-3 text-base font-normal tracking-tight">Success markers</h3>
          <ul className="m-0 pl-5 text-secondary text-sm list-disc">
            {markers.map((m) => (
              <li key={m.date + m.influencerName} className="mb-1">
                {m.date}: {m.influencerName}
                {m.postUrl && (
                  <a href={m.postUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm link-accent">
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
          <h3 className="mb-4 text-base font-normal tracking-tight">Sales records</h3>
          <div className="flex flex-col gap-2">
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
      <div className="flex gap-3 items-center flex-wrap p-4 bg-secondary rounded-lg shadow-clay-inset">
        <input type="number" step="0.01" className="input w-24" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <input type="date" className="input w-36" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className="input flex-1 min-w-[120px]" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button type="button" className="btn btn-sm btn-primary btn-interactive" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button type="button" className="btn btn-secondary btn-sm btn-interactive" onClick={() => setEditing(false)}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center p-4 bg-secondary rounded-lg shadow-clay-sm flex-wrap gap-2">
      <div>
        <span className="font-medium text-success tnum">{"$" + Number(record.amount).toLocaleString()}</span>
        <span className="text-muted ml-2 text-sm tnum">{record.date.slice(0, 10)}</span>
        {record.notes && <span className="text-secondary ml-2 text-sm"> - {record.notes}</span>}
      </div>
      <div className="flex gap-2">
        <button type="button" className="btn btn-ghost btn-sm btn-interactive" onClick={() => setEditing(true)}>
          Edit
        </button>
        {!showDeleteConfirm ? (
          <button type="button" className="btn btn-ghost btn-sm btn-danger btn-interactive" onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </button>
        ) : (
          <>
            <span className="text-sm text-error">Delete?</span>
            <button type="button" className="btn btn-sm btn-danger btn-interactive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "..." : "Yes"}
            </button>
            <button type="button" className="btn btn-secondary btn-sm btn-interactive" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
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
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] transition-opacity duration-250"
      onClick={onClose}
    >
      <div className="card card-elevated max-w-[400px] w-90 m-4 p-6 rounded-xl shadow-clay-lg animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-normal tracking-tight">Add sales record</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          {error && <p className="text-error text-sm">{error}</p>}
          <div className="flex gap-3 mt-2">
            <button type="submit" className="btn btn-primary btn-interactive" disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </button>
            <button type="button" className="btn btn-secondary btn-interactive" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
