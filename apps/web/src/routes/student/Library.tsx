import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Bookmark, Clock, FileText, Plus, Trash2 } from 'lucide-react';

export function Library() {
  const [tab, setTab] = useState<'bookmarks' | 'recent' | 'private'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [privateNotes, setPrivateNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'bookmarks') {
        const r = await api<{ items: any[] }>('/bookmarks'); setBookmarks(r.items);
      } else if (tab === 'recent') {
        const r = await api<{ items: any[] }>('/recently-viewed'); setRecent(r.items);
      } else {
        const r = await api<{ items: any[] }>('/private-notes'); setPrivateNotes(r.items);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [tab]);

  const tabs = [
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'recent', label: 'Recently Viewed', icon: Clock },
    { id: 'private', label: 'My Notes', icon: FileText },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">My Library</h1>
        <p className="text-slate-500 dark:text-slate-400">Everything you've saved in one place.</p>
      </div>

      <div className="inline-flex gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-white/5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div></div>}

      {!loading && tab === 'bookmarks' && (
        bookmarks.length === 0 ? (
          <EmptyState icon={Bookmark} title="No bookmarks yet" desc="Save notes you want to read later by clicking the bookmark icon." cta="Explore Library" ctaTo="/student/explore" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks.map((b: any) => (
              <Link key={b.id} to={`/student/explore/${b.note.id}`} className="card p-5 hover:border-brand-300 dark:hover:border-brand-500/40">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{b.note.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{b.note.resourceType} · {b.note.uploader?.name || 'Unknown'}</p>
              </Link>
            ))}
          </div>
        )
      )}

      {!loading && tab === 'recent' && (
        recent.length === 0 ? (
          <EmptyState icon={Clock} title="No recent views" desc="Notes you've opened will appear here for quick access." cta="Start browsing" ctaTo="/student/explore" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((r: any) => (
              <Link key={r.id} to={`/student/explore/${r.note.id}`} className="card p-5 hover:border-brand-300 dark:hover:border-brand-500/40">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{r.note.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{r.note.resourceType}</p>
              </Link>
            ))}
          </div>
        )
      )}

      {!loading && tab === 'private' && (
        privateNotes.length === 0 ? (
          <EmptyState icon={FileText} title="No personal notes yet" desc="Create quick study notes that only you can see." cta="Create Note" ctaTo="/student/notes" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {privateNotes.map((p: any) => (
              <div key={p.id} className="card p-5 relative">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{p.title || 'Untitled'}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{p.content}</p>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, cta, ctaTo }: any) {
  return (
    <div className="card p-16 text-center border-dashed border-2 border-slate-200 dark:border-white/10">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 mb-4">
        <Icon className="h-7 w-7 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 mb-5 max-w-sm mx-auto">{desc}</p>
      <Link to={ctaTo} className="btn-primary inline-flex">{cta}</Link>
    </div>
  );
}
