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

  // Private note form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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
    try {
      await api('/private-notes', { method: 'POST', body: JSON.stringify({ title: newTitle, content: newContent }) });
      setNewTitle(''); setNewContent(''); setIsCreating(false); loadData();
    } catch (err) { alert('Failed to save'); }
  };

  const deletePrivateNote = async (id: number) => {
    if (!confirm('Delete this note?')) return;
    try { await api(`/private-notes/${id}`, { method: 'DELETE' }); loadData(); } catch (err) {}
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <h1 className="text-3xl font-extrabold text-white">My Library</h1>
      
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button onClick={() => setTab('bookmarks')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${tab === 'bookmarks' ? 'bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}>
          <Bookmark className="h-4 w-4" /> Bookmarks
        </button>
        <button onClick={() => setTab('recent')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${tab === 'recent' ? 'bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}>
          <Clock className="h-4 w-4" /> Recently Viewed
        </button>
        <button onClick={() => setTab('private')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${tab === 'private' ? 'bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}>
          <FileText className="h-4 w-4" /> Private Notes
        </button>
      </div>

      {loading ? <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div></div> : (
        <>
          {tab === 'bookmarks' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarks.length === 0 && <p className="text-slate-400">No bookmarks yet.</p>}
              {bookmarks.map(b => (
                <Link key={b.id} to={`/notes/${b.note.id}`} className="glass p-5 rounded-xl hover:border-indigo-500/50 transition-colors">
                  <h3 className="font-bold text-white mb-1">{b.note.title}</h3>
                  <p className="text-xs text-slate-400">{b.note.resourceType} · {b.note.uploader.name}</p>
                </Link>
              ))}
            </div>
          )}

          {tab === 'recent' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recent.length === 0 && <p className="text-slate-400">No recent views.</p>}
              {recent.map(r => (
                <Link key={r.id} to={`/notes/${r.note.id}`} className="glass p-5 rounded-xl hover:border-indigo-500/50 transition-colors">
                  <h3 className="font-bold text-white mb-1">{r.note.title}</h3>
                  <p className="text-xs text-slate-400">{r.note.resourceType}</p>
                </Link>
              ))}
            </div>
          )}

          {tab === 'private' && (
            <div className="space-y-4">
              {!isCreating ? (
                <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
                  <Plus className="h-4 w-4" /> New Private Note
                </button>
              ) : (
                <form onSubmit={createPrivateNote} className="glass p-5 rounded-xl space-y-3">
                  <input required placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="input-field" />
                  <textarea required placeholder="Write your notes here..." value={newContent} onChange={e => setNewContent(e.target.value)} className="input-field" rows={4} />
                  <div className="flex gap-2">
                    <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Save</button>
                    <button type="button" onClick={() => setIsCreating(false)} className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600">Cancel</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {privateNotes.map(p => (
                  <div key={p.id} className="glass p-5 rounded-xl relative group">
                    <h3 className="font-bold text-white mb-2">{p.title}</h3>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{p.content}</p>
                    <button onClick={() => deletePrivateNote(p.id)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
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
