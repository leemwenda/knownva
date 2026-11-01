import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Stats {
  users: { total: number };
  notes: { total: number; pending: number; approved: number };
  downloads: { last24h: number; last7d: number; last30d: number };
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api<{ ok: true } & Stats>('/admin/dashboard')
      .then(res => setStats(res))
      .catch(() => {});
  }, []);

  if (!stats) return <p>Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded bg-white p-4 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Total Users</h2>
          <p className="text-3xl font-bold">{stats.users.total}</p>
        </div>
        <div className="rounded bg-white p-4 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Total Notes</h2>
          <p className="text-3xl font-bold">{stats.notes.total}</p>
          <p className="text-sm text-amber-600">{stats.notes.pending} pending</p>
        </div>
        <div className="rounded bg-white p-4 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Downloads (30d)</h2>
          <p className="text-3xl font-bold">{stats.downloads.last30d}</p>
        </div>
      </div>
    </div>
  );
}
