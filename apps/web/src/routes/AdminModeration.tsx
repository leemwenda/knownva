import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface PendingNote {
  id: number;
  title: string;
  description: string;
  uploader: { name: string; email: string };
}

export function AdminModeration() {
  const [notes, setNotes] = useState<PendingNote[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api<{ ok: true; items: PendingNote[] }>('/moderation/pending')
      .then(res => setNotes(res.items))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const decide = async (id: number, decision: 'approve' | 'reject') => {
    let reason = '';
    if (decision === 'reject') {
      reason = prompt('Enter rejection reason (min 3 chars):') || '';
      if (reason.length < 3) return;
    }
    try {
      await api(`/moderation/${id}/decide`, {
        method: 'POST',
        body: JSON.stringify({ decision, reason }),
      });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pending Moderation</h1>
      {notes.length === 0 && <p className="text-slate-600">No pending notes.</p>}
      <ul className="space-y-2">
        {notes.map(n => (
          <li key={n.id} className="flex items-center justify-between rounded bg-white p-4 shadow-sm">
            <div>
              <p className="font-semibold">{n.title}</p>
              <p className="text-sm text-slate-500">by {n.uploader.name} ({n.uploader.email})</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => decide(n.id, 'approve')} className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700">Approve</button>
              <button onClick={() => decide(n.id, 'reject')} className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700">Reject</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
