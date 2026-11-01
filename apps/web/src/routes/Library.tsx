import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Bookmark, Clock, FileText, Trash2, Plus } from 'lucide-react';

interface Note { id: number; title: string; resourceType: string; uploader: { name: string }; }
interface BookmarkRow { id: number; note: Note; }
interface RecentRow { id: number; note: Note; }
interface PrivateNote { id: number; title: string; content: string; }

export function Library() {
  const [tab, setTab] = useState<'bookmarks' | 'recent' | 'private'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>([]);
  const [recent, setRecent] = useState<RecentRow[]>([]);
  const [privateNotes, setPrivateNotes] = useState<PrivateNote[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState(''); const [newContent, setNewContent] = useState(''); const [isCreating, setIsCreating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'bookmarks') setBookmarks((await api<{ items: BookmarkRow[] }>('/bookmarks')).items);
      if (tab === 'recent') setRecent((await api<{ items: RecentRow[] }>('/recently-viewed')).items);
      if (tab === 'private') setPrivateNotes((await api<{ items: PrivateNote[] }>('/private-notes')).items);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [tab]);

  const createPrivateNote = async (e: FormEvent) => {
    e.preventDefault();
    try { await api('/private-notes', { method: 'POST', body: JSON.stringify({ title: newTitle, content: newContent }) }); setNewTitle(''); setNewContent(''); setIsCreating(false); loadData(); } catch (err) { alert('Failed to save'); }
  };

  const deletePrivateNote = async (id: number) => {
    if (!confirm('Delete this note?')) return;
    try { await api(`/private-notes/${id}`, { method: 'DELETE' }); loadData(); } catch (err) {}
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-1">My Library</h1>
      
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl w-fit">
        <button onClick={() => setTab('bookmarks')} className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === 'bookmarks' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
          <Bookmark className="h-4 w-4" /> Bookmarks
        </button>
        <button onClick={() => setTab('recent')} className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === 'recent' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
          <Clock className="h-4 w-4" /> Recently Viewed
        </button>
        <button onClick={() => setTab('private')} className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === 'private' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
          <FileText className="h-4 w-4" /> My Notes
        </button>
      </div>

      {loading ? <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div></div> : (
        <>
          {tab === 'bookmarks' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.length === 0 && <p className="text-slate-500 col-span-3">No bookmarks yet.</p>}
              {bookmarks.map(b => (
                <Link key={b.id} to={`/notes/${b.note.id}`} className="card p-5 hover:border-brand-200">
                  <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{b.note.title}</h3>
                  <p className="text-xs text-slate-500">{b.note.resourceType} · {b.note.uploader.name}</p>
                </Link>
              ))}
            </div>
          )}

          {tab === 'recent' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recent.length === 0 && <p className="text-slate-500 col-span-3">No recent views.</p>}
              {recent.map(r => (
                <Link key={r.id} to={`/notes/${r.note.id}`} className="card p-5 hover:border-brand-200">
                  <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{r.note.title}</h3>
                  <p className="text-xs text-slate-500">{r.note.resourceType}</p>
                </Link>
              ))}
            </div>
          )}

          {tab === 'private' && (
            <div className="space-y-6">
              {!isCreating ? (
                <button onClick={() => setIsCreating(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> New Note</button>
              ) : (
                <form onSubmit={createPrivateNote} className="card p-6 space-y-4">
                  <input required placeholder="Note Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="input-field font-bold" />
                  <textarea required placeholder="Write your notes here..." value={newContent} onChange={e => setNewContent(e.target.value)} className="input-field" rows={5} />
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary">Save Note</button>
                    <button type="button" onClick={() => setIsCreating(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200">Cancel</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {privateNotes.map(p => (
                  <div key={p.id} className="card p-6 relative group bg-amber-50/50 border-amber-100">
                    <h3 className="font-bold text-slate-900 mb-3">{p.title}</h3>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{p.content}</p>
                    <button onClick={() => deletePrivateNote(p.id)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
