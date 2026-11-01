import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { CheckCircle, XCircle } from 'lucide-react';

interface PendingNote { id: number; title: string; description: string; uploader: { name: string; email: string }; }

export function AdminModeration() {
  const [notes, setNotes] = useState<PendingNote[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => { api<{ ok: true; items: PendingNote[] }>('/moderation/pending').then(res => setNotes(res.items)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const decide = async (id: number, decision: 'approve' | 'reject') => {
    let reason = '';
    if (decision === 'reject') { reason = prompt('Enter rejection reason (min 3 chars):') || ''; if (reason.length < 3) return; }
    try { await api(`/moderation/${id}/decide`, { method: 'POST', body: JSON.stringify({ decision, reason }) }); load(); } 
    catch (err) { alert(err instanceof Error ? err.message : 'Action failed'); }
  };

  if (loading) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold text-white">Pending Moderation</h1>
      {notes.length === 0 ? <p className="text-slate-400">No pending notes.</p> : (
        <ul className="space-y-3">
          {notes.map(n => (
            <li key={n.id} className="glass flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl p-5 hover:border-slate-600 transition-colors">
              <div>
                <p className="font-bold text-white text-lg">{n.title}</p>
                <p className="text-sm text-slate-400">by <span className="text-slate-300">{n.uploader.name}</span> ({n.uploader.email})</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => decide(n.id, 'approve')} className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-400 hover:bg-green-500/20 transition-colors"><CheckCircle className="h-4 w-4"/> Approve</button>
                <button onClick={() => decide(n.id, 'reject')} className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors"><XCircle className="h-4 w-4"/> Reject</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
