import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { FileText, Star, Download, GraduationCap, Search } from 'lucide-react';

interface Note {
  id: number; title: string; description: string; resourceType: string;
  isPremium: boolean; averageRating: number; downloadsCount: number;
  uploader: { id: number; name: string };
}

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    setLoading(true);
    let url = `/notes?pageSize=50`;
    if (search) url += `&q=${encodeURIComponent(search)}`;
    if (type) url += `&resourceType=${encodeURIComponent(type)}`;

    api<{ items: Note[]; total: number }>(url)
      .then((res) => { setNotes(res.items); setTotal(res.total); })
      .finally(() => setLoading(false));
  }, [search, type]);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Explore Library</h1>
          <p className="text-slate-400">Discover {total} study materials.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={type} onChange={e => setType(e.target.value)} className="input-field w-full sm:w-40 bg-slate-900">
            <option value="">All Types</option>
            <option value="Notes">Notes</option>
            <option value="Past Paper">Past Paper</option>
            <option value="Study Guide">Study Guide</option>
          </select>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input type="text" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-64 rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div></div>
      ) : notes.length === 0 ? (
        <div className="glass text-center py-24 rounded-2xl">
          <FileText className="mx-auto h-12 w-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No resources found</h3>
          <p className="text-slate-400">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((n) => (
            <Link key={n.id} to={`/notes/${n.id}`} className="glass group flex flex-col rounded-2xl p-6 hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-1 rounded-md">
                  <FileText className="h-3.5 w-3.5" /> {n.resourceType}
                </div>
                {n.isPremium && <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-400 uppercase">Premium</span>}
              </div>
              <h2 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">{n.title}</h2>
              <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-1">{n.description}</p>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-400 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-400" /> {n.averageRating}</div>
                <div className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> {n.downloadsCount}</div>
                <div className="flex items-center gap-1.5 ml-auto truncate max-w-[120px]"><GraduationCap className="h-3.5 w-3.5" /> {n.uploader.name}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
