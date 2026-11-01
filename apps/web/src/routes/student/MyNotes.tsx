import { useState, useEffect, useRef, type FormEvent } from 'react';
import { api } from '../../lib/api';
import { Plus, FileText, File, Download, Trash2, X, Save, Loader2, Image as ImageIcon } from 'lucide-react';

export function MyNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api<{ items: any[] }>('/private-notes');
      setNotes(res.items);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setTitle(''); setContent(''); setFile(null); setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !file) { setError('Add text or attach a file'); return; }
    setBusy(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('content', content);
      if (file) fd.append('file', file);
      await api('/private-notes', { method: 'POST', body: fd });
      reset();
      setShowForm(false);
      load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to save'); }
    finally { setBusy(false); }
  };

  const onDelete = async (id: number) => {
    if (!confirm('Delete this note permanently?')) return;
    try { await api(`/private-notes/${id}`, { method: 'DELETE' }); load(); } catch { }
  };

  const onDownload = (id: number) => {
    window.open(`/api/v1/private-notes/${id}/download`, '_blank');
  };

  const fileIcon = (mime?: string | null) => {
    if (!mime) return File;
    if (mime.startsWith('image/')) return ImageIcon;
    return File;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">My Notes</h1>
          <p className="text-slate-500 dark:text-slate-400">Your private study materials — only you can see these.</p>
        </div>
        <button onClick={() => { setShowForm(true); setError(null); }} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Note
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={onCreate} className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create a Note</h2>
            <button type="button" onClick={() => { setShowForm(false); reset(); }} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && <div className="rounded-xl bg-red-50 dark:bg-red-500/10 p-3 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Title (optional)</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="e.g. Biology Chapter 3 summary" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Content</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} className="input-field" rows={6} placeholder="Write your notes here... (or leave blank if uploading a file)" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Attach a File (optional)</label>
            <div className="flex items-center gap-3">
              <input ref={fileInputRef} type="file" onChange={e => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.txt"
                className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 dark:file:bg-brand-500/10 dark:file:text-brand-300 dark:hover:file:bg-brand-500/20 file:cursor-pointer" />
              {file && (
                <button type="button" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="text-xs font-bold text-red-500 hover:text-red-600 whitespace-nowrap">
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">PDF, DOC, PPT, PNG, JPG, WEBP, TXT · Max 25MB</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={busy} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {busy ? 'Saving...' : 'Save Note'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); reset(); }}
              className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Notes grid */}
      {loading && <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>}

      {!loading && notes.length === 0 && !showForm && (
        <div className="card p-16 text-center border-dashed border-2 border-slate-200 dark:border-white/10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-500/10 mb-4">
            <FileText className="h-7 w-7 text-brand-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No notes yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-5">Create your first note — write text, attach a file, or both.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary inline-flex">+ New Note</button>
        </div>
      )}

      {!loading && notes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map(note => {
            const Icon = fileIcon(note.fileMime);
            return (
              <div key={note.id} className="card p-5 group relative">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={`p-2 rounded-lg flex-none ${note.hasFile ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-500 dark:text-blue-300' : 'bg-brand-50 dark:bg-brand-500/15 text-brand-500 dark:text-brand-300'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{note.title || 'Untitled Note'}</h3>
                  </div>
                  <button onClick={() => onDelete(note.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {note.content && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap line-clamp-4 mb-3">
                    {note.content}
                  </p>
                )}

                {note.hasFile && (
                  <button onClick={() => onDownload(note.id)}
                    className="flex items-center gap-2 w-full rounded-xl bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                    <Download className="h-3.5 w-3.5 flex-none" />
                    <span className="truncate">{note.fileName || 'Attached file'}</span>
                    {note.fileSize && <span className="ml-auto text-slate-400 dark:text-slate-500">{(note.fileSize / 1024).toFixed(0)} KB</span>}
                  </button>
                )}

                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-3 uppercase tracking-wide">
                  {new Date(note.updatedAt || note.createdAt).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
