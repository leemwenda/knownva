import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { FileText, Star, Download, GraduationCap, ArrowRight } from 'lucide-react';

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

  if (loading) return <div className="animate-pulse flex space-x-4">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Browse Resources</h1>
          <p className="text-slate-500 mt-1">Discover {total} study materials from top students.</p>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No resources yet</h3>
          <p className="text-slate-500">Be the first to upload study material!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((n) => (
            <Link key={n.id} to={`/notes/${n.id}`} className="group flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-blue-300 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-600 uppercase">
                  <FileText className="h-4 w-4" />
                  {n.resourceType}
                </div>
                {n.isPremium && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">Premium</span>
                )}
              </div>
              
              <h2 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{n.title}</h2>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{n.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-400" /> {n.averageRating}</div>
                <div className="flex items-center gap-1"><Download className="h-3.5 w-3.5" /> {n.downloadsCount}</div>
                <div className="flex items-center gap-1 ml-auto truncate max-w-[120px]"><GraduationCap className="h-3.5 w-3.5" /> {n.uploader.name}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
