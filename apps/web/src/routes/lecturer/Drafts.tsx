import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { FileText, Clock } from 'lucide-react';

export function Drafts() {
  const [notes, setNotes] = useState<any[]>([]);
  useEffect(() => { api<{items:any[]}>('/notes?mine=true&status=draft').then(r => setNotes(r.items)); }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-slate-900">My Drafts</h1>
      {notes.length === 0 ? (
        <div className="card p-10 text-center border-dashed"><FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">No drafts saved.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(n => (
            <div key={n.id} className="card p-6 flex flex-col border-amber-200">
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit mb-3"><Clock className="h-3 w-3 inline mr-1"/> Draft</span>
              <h3 className="font-bold text-slate-900 mb-2">{n.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{n.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
