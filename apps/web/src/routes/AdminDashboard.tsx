import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Users, FileText, Download } from 'lucide-react';

interface Stats { users: { total: number }; notes: { total: number; pending: number; approved: number }; downloads: { last24h: number; last7d: number; last30d: number }; }

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => { api<{ ok: true } & Stats>('/admin/dashboard').then(res => setStats(res)).catch(() => {}); }, []);
  if (!stats) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 text-indigo-400 mb-4"><Users className="h-5 w-5" /><h2 className="font-semibold">Total Users</h2></div>
          <p className="text-4xl font-extrabold text-white">{stats.users.total}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 text-purple-400 mb-4"><FileText className="h-5 w-5" /><h2 className="font-semibold">Total Notes</h2></div>
          <p className="text-4xl font-extrabold text-white">{stats.notes.total}</p>
          <p className="text-sm text-amber-400 mt-2">{stats.notes.pending} pending review</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 text-cyan-400 mb-4"><Download className="h-5 w-5" /><h2 className="font-semibold">Downloads (30d)</h2></div>
          <p className="text-4xl font-extrabold text-white">{stats.downloads.last30d}</p>
        </div>
      </div>
    </div>
  );
}
