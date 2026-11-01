import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Users, BookOpen, Activity, DollarSign } from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api<{ users: any, notes: any, downloads: any }>('/admin/dashboard').then(res => setStats(res)).catch(console.error);
  }, []);

  if (!stats) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-1 dark:text-white">Platform Overview</h1>
        <p className="text-slate-600 font-medium dark:text-slate-300">A complete overview of your KnowVa platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 text-brand-600 mb-3"><Users className="h-5 w-5"/><p className="text-sm font-bold text-slate-600 dark:text-slate-300">Total Users</p></div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.users.total.toLocaleString()}</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-2 text-orange-500 mb-3"><Activity className="h-5 w-5"/><p className="text-sm font-bold text-slate-600 dark:text-slate-300">Active Today</p></div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.downloads.last24h.toLocaleString()}</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-2 text-cyan-500 mb-3"><BookOpen className="h-5 w-5"/><p className="text-sm font-bold text-slate-600 dark:text-slate-300">Resources</p></div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.notes.total.toLocaleString()}</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-2 text-green-500 mb-3"><DollarSign className="h-5 w-5"/><p className="text-sm font-bold text-slate-600 dark:text-slate-300">Revenue</p></div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">$0</p>
        </div>
      </div>

      <div className="card p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Platform Growth</h2>
          <div className="flex items-center gap-4">
             <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300"><span className="h-2 w-2 rounded-full bg-brand-500"></span> Students</span>
             <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300"><span className="h-2 w-2 rounded-full bg-cyan-400"></span> Lecturers</span>
          </div>
        </div>
        <div className="h-64 w-full bg-slate-50 rounded-xl relative overflow-hidden flex items-end border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            <svg viewBox="0 0 1000 200" className="w-full h-full absolute inset-0 preserve-3d">
               <path d="M0,150 Q100,120 200,130 T400,80 T600,100 T800,50 T1000,40 L1000,200 L0,200 Z" fill="url(#grad1)" opacity="0.1"/>
               <path d="M0,150 Q100,120 200,130 T400,80 T600,100 T800,50 T1000,40" fill="none" stroke="#635BDB" strokeWidth="3"/>
               <path d="M0,180 Q100,170 200,180 T400,140 T600,150 T800,110 T1000,90" fill="none" stroke="#22D3EE" strokeWidth="3"/>
               <defs><linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#635BDB"/><stop offset="100%" stopColor="#FFFFFF"/></linearGradient></defs>
            </svg>
            <div className="absolute bottom-2 left-4 flex gap-4 text-[10px] font-bold text-slate-500 dark:text-slate-400">
               <span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
            </div>
        </div>
      </div>
    </div>
  );
}
