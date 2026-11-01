import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { FileText, Star, Download, GraduationCap, Search, Filter, AlertCircle } from 'lucide-react';

interface Note { id: number; title: string; description: string; resourceType: string; isPremium: boolean; averageRating: number; downloadsCount: number; uploader?: { id: number; name: string }; }

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    let url = `/notes?pageSize=48`; // 48 is the schema max
    if (search) url += `&q=${encodeURIComponent(search)}`;
    if (type) url += `&resourceType=${encodeURIComponent(type)}`;

    api<{ items: Note[]; total: number }>(url)
      .then((res) => { setNotes(res.items); setTotal(res.total); })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load notes'))
      .finally(() => setLoading(false));
  }, [search, type]);

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div></div>;

  if (error) return (
    <div className="card p-10 text-center border-red-200 bg-red-50">
      <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-bold text-slate-900 mb-1 dark:text-white">Failed to load resources</h3>
      <p className="text-slate-700 mb-4 dark:text-slate-200">{error}</p>
      <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1 dark:text-white">Explore Library</h1>
          <p className="text-slate-600 font-medium dark:text-slate-300">Discover {total} approved study materials.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <select value={type} onChange={e => setType(e.target.value)} className="input-field pl-10 pr-8 appearance-none bg-white cursor-pointer w-full sm:w-40 dark:bg-slate-800">
              <option value="">All Types</option>
              <option value="Notes">Notes</option>
              <option value="Past Paper">Past Paper</option>
              <option value="Study Guide">Study Guide</option>
            </select>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <input type="text" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10 w-full sm:w-64" />
          </div>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="card text-center py-24 border-dashed bg-white dark:bg-slate-800">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1 dark:text-white">No approved resources found</h3>
          <p className="text-slate-600 max-w-md mx-auto dark:text-slate-300">Try searching for something else, or ask a lecturer to upload notes!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((n) => (
            <Link key={n.id} to={`/student/explore/${n.id}`} className="card group flex flex-col p-6 hover:shadow-lg transition-all border border-slate-100 hover:border-brand-200 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider text-brand-600 uppercase bg-brand-50 px-2.5 py-1 rounded-md">
                  <FileText className="h-3.5 w-3.5" /> {n.resourceType || 'Notes'}
                </div>
                {n.isPremium && <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700 uppercase">Premium</span>}
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors dark:text-white">{n.title}</h2>
              <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1 dark:text-slate-400">{n.description || 'No description provided.'}</p>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-4 border-t border-slate-100 dark:text-slate-400 dark:border-slate-800">
                <div className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-400" /> {n.averageRating || 0}</div>
                <div className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> {n.downloadsCount || 0}</div>
                <div className="flex items-center gap-1.5 ml-auto truncate max-w-[120px]"><GraduationCap className="h-3.5 w-3.5" /> {n.uploader?.name || 'Unknown'}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
