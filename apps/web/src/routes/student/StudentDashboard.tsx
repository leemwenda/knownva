import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Search, Sparkles, BookOpen, Clock, ChevronRight, Bookmark, FileText } from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ bookmarks: 0, notes: 0, exams: 0, plans: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<{ items: any[] }>('/bookmarks'),
      api<{ items: any[] }>('/private-notes'),
      api<{ items: any[] }>('/student/planner'),
      api<{ items: any[] }>('/recently-viewed')
    ]).then(([b, p, pl, r]) => {
      setStats({
        bookmarks: b.items.length,
        notes: p.items.length,
        plans: pl.items.length,
        exams: pl.items.filter((i: any) => i.type === 'exam').length
      });
      setRecent(r.items.slice(0, 3)); // top 3 recent
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Good morning, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500">Your academic workspace at a glance.</p>
        </div>
        <Link to="/student/explore" className="btn-primary flex items-center gap-2">
          <Search className="h-4 w-4" /> Explore Resources
        </Link>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Saved Resources</h3>
            <div className="p-2 bg-brand-50 rounded-lg text-brand-500"><Bookmark className="h-5 w-5" /></div>
          </div>
          <p className="text-4xl font-bold text-slate-900">{stats.bookmarks}</p>
          <p className="text-sm text-slate-500 mt-2">In your library</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Personal Notes</h3>
            <div className="p-2 bg-cyan-50 rounded-lg text-cyan-500"><FileText className="h-5 w-5" /></div>
          </div>
          <p className="text-4xl font-bold text-slate-900">{stats.notes}</p>
          <p className="text-sm text-slate-500 mt-2">Created by you</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Upcoming Exams</h3>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-500"><Clock className="h-5 w-5" /></div>
          </div>
          <p className="text-4xl font-bold text-slate-900">{stats.exams}</p>
          <p className="text-sm text-slate-500 mt-2">{stats.plans} total study plans</p>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-brand-900 p-8 text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-brand-500 opacity-20 blur-3xl"></div>
        <div className="relative z-10 md:w-2/3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4 text-cyan-300" /> AI Study Assistant
          </div>
          <h2 className="text-2xl font-bold mb-2">Struggling with a concept?</h2>
          <p className="text-brand-100 mb-6">Ask anything about your notes, upload a PDF, or generate study materials instantly.</p>
          <Link to="/student/ai" className="inline-flex bg-white text-brand-900 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-100 transition-colors">
            Open Assistant
          </Link>
        </div>
      </div>

      {/* Continue Learning */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Recently Viewed</h2>
          <Link to="/student/explore" className="text-sm font-medium text-brand-500 hover:text-brand-600">View All →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="card p-8 text-center border-dashed">
            <p className="text-slate-500">You haven't viewed any resources yet. Start exploring!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {recent.map(r => (
               <Link to={`/student/explore/${r.note.id}`} key={r.id} className="card p-5 hover:border-brand-300 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><BookOpen className="h-4 w-4" /></div>
                    <span className="text-xs font-bold text-slate-400 uppercase">{r.note.resourceType}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 group-hover:text-brand-500 transition-colors line-clamp-1">{r.note.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-1">{r.note.uploader.name}</p>
               </Link>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
