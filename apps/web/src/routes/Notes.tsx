import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

interface Note {
  id: number;
  title: string;
  description: string;
  resourceType: string;
  isPremium: boolean;
  averageRating: number;
  downloadsCount: number;
  uploader: { id: number; name: string };
  institution: { id: number; name: string } | null;
}

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ items: Note[]; total: number }>('/notes?pageSize=20')
      .then((res) => { setNotes(res.items); setTotal(res.total); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Browse resources</h1>
        <span className="text-sm text-slate-500">{total} total</span>
      </div>
      {notes.length === 0 && <p className="text-slate-600">No approved notes yet.</p>}
      <ul className="space-y-2">
        {notes.map((n) => (
          <li key={n.id} className="rounded bg-white p-4 shadow-sm hover:shadow">
            <Link to={`/notes/${n.id}`} className="font-semibold text-blue-700">
              {n.title}
            </Link>
            <p className="line-clamp-1 text-sm text-slate-600">{n.description}</p>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
              <span>{n.resourceType}</span>
              {n.institution && <span>{n.institution.name}</span>}
              <span>by {n.uploader.name}</span>
              <span>★ {n.averageRating}</span>
              <span>↓ {n.downloadsCount}</span>
              {n.isPremium && <span className="text-amber-600">Premium</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
