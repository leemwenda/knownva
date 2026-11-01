import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Shield } from 'lucide-react';

export function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => { api<{items:any[]}>('/admin/audit').then(r => setLogs(r.items)); }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 dark:text-white"><Shield className="h-8 w-8 text-brand-500"/> Audit Logs</h1>
      <div className="card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700">
            <tr><th className="px-6 py-4">Action</th><th className="px-6 py-4">Target</th><th className="px-6 py-4">Actor ID</th><th className="px-6 py-4">Date</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {logs.map(l => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-semibold text-brand-600">{l.action}</td>
                <td className="px-6 py-4 text-slate-700 dark:text-slate-200">{l.targetType} #{l.targetId}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">User {l.actorId}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(l.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
