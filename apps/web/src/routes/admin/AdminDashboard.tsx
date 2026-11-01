import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Users, FileText, Download, TrendingUp } from 'lucide-react';

interface Stats { users: { total: number }; notes: { total: number; pending: number; approved: number }; downloads: { last24h: number; last7d: number; last30d: number }; }

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => { api<{ ok: true } & Stats>('/admin/dashboard').then(res => setStats(res)).catch(() => {}); }, []);
  if (!stats) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Platform Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 text-brand-500 mb-4"><Users className="h-6 w-6" /><h2 className="font-bold text-slate-700">Total Users</h2></div>
          <p className="text-4xl font-extrabold text-slate-900">{stats.users.total}</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 text-brand-500 mb-4"><FileText className="h-6 w-6" /><h2 className="font-bold text-slate-700">Total Notes</h2></div>
          <p className="text-4xl font-extrabold text-slate-900">{stats.notes.total}</p>
          <p className="text-sm font-semibold text-amber-500 mt-2">{stats.notes.pending} pending review</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 text-brand-500 mb-4"><Download className="h-6 w-6" /><h2 className="font-bold text-slate-700">Downloads (30d)</h2></div>
          <p className="text-4xl font-extrabold text-slate-900">{stats.downloads.last30d}</p>
        </div>
      </div>
    </div>
  );
}
