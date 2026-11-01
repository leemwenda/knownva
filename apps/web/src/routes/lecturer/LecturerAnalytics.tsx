import { TrendingUp, Download, Star, Users } from 'lucide-react';

export function LecturerAnalytics() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-1 dark:text-white">Analytics & Impact</h1>
        <p className="text-slate-500 dark:text-slate-400">Track how students engage with your resources.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6"><div className="text-brand-500 mb-2"><Download className="h-5 w-5"/></div><p className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Downloads</p><p className="text-3xl font-extrabold text-slate-900 dark:text-white">1,248</p></div>
        <div className="card p-6"><div className="text-indigo-500 mb-2"><Users className="h-5 w-5"/></div><p className="text-sm font-bold text-slate-500 dark:text-slate-400">Unique Students</p><p className="text-3xl font-extrabold text-slate-900 dark:text-white">430</p></div>
        <div className="card p-6"><div className="text-amber-500 mb-2"><Star className="h-5 w-5"/></div><p className="text-sm font-bold text-slate-500 dark:text-slate-400">Average Rating</p><p className="text-3xl font-extrabold text-slate-900 dark:text-white">4.8</p></div>
        <div className="card p-6"><div className="text-green-500 mb-2"><TrendingUp className="h-5 w-5"/></div><p className="text-sm font-bold text-slate-500 dark:text-slate-400">Engagement Rate</p><p className="text-3xl font-extrabold text-slate-900 dark:text-white">87%</p></div>
      </div>

      <div className="card p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-6 dark:text-white">Download Trends (Last 30 Days)</h2>
        <div className="h-64 w-full bg-slate-50 rounded-xl relative flex items-end border border-slate-100 p-4 dark:bg-slate-900 dark:border-slate-800">
           <svg viewBox="0 0 1000 200" className="w-full h-full preserve-3d">
               <path d="M0,180 Q100,150 200,160 T400,100 T600,120 T800,60 T1000,30 L1000,200 L0,200 Z" fill="url(#grad1)" opacity="0.1"/>
               <path d="M0,180 Q100,150 200,160 T400,100 T600,120 T800,60 T1000,30" fill="none" stroke="#635BDB" strokeWidth="4"/>
               <defs><linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#635BDB"/><stop offset="100%" stopColor="#FFFFFF"/></linearGradient></defs>
            </svg>
        </div>
      </div>
    </div>
  );
}
