import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { CheckCircle, XCircle, FileText } from 'lucide-react';

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

  if (loading) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-slate-900">Pending Moderation</h1>
      {notes.length === 0 ? (
        <div className="card p-10 text-center border-dashed">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
          <p className="text-slate-500">There are no pending resources to review.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {notes.map(n => (
            <li key={n.id} className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-brand-200">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-brand-50 text-brand-600 text-xs font-bold px-2 py-1 rounded">Review Required</span>
                </div>
                <p className="font-bold text-slate-900 text-lg mb-1">{n.title}</p>
                <p className="text-sm text-slate-500">Uploaded by <span className="font-semibold text-slate-700">{n.uploader.name}</span> ({n.uploader.email})</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button onClick={() => decide(n.id, 'approve')} className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2.5 text-sm font-bold text-green-700 hover:bg-green-100 transition-colors"><CheckCircle className="h-4 w-4"/> Approve</button>
                <button onClick={() => decide(n.id, 'reject')} className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 transition-colors"><XCircle className="h-4 w-4"/> Reject</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
