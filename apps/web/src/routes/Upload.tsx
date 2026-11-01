import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { UploadCloud } from 'lucide-react';

interface AcademicData { institutions: { id: number; name: string }[]; fields: { id: number; name: string }[]; levels: { id: number; name: string }[]; }

export function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [academic, setAcademic] = useState<AcademicData>({ institutions: [], fields: [], levels: [] });
  const [title, setTitle] = useState(''); const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('Notes'); const [isPremium, setIsPremium] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [institutionId, setInstitutionId] = useState(''); const [fieldId, setFieldId] = useState(''); const [levelId, setLevelId] = useState('');
  const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false);

  useEffect(() => { api<{ ok: true } & AcademicData>('/academic/structure').then(res => setAcademic(res)).catch(() => {}); }, []);

  if (user?.role !== 'lecturer' && user?.role !== 'superadmin') return <p className="text-red-400">Only lecturers can upload.</p>;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault(); if (!file) { setError('Select a file'); return; }
    setBusy(true); setError(null);
    const fd = new FormData();
    fd.append('title', title); fd.append('description', description); fd.append('resourceType', resourceType);
    fd.append('isPremium', String(isPremium)); fd.append('confirmedOwnership', 'true');
    if (institutionId) fd.append('institutionId', institutionId); if (fieldId) fd.append('fieldId', fieldId); if (levelId) fd.append('levelId', levelId);
    fd.append('file', file);
    try { await api('/notes', { method: 'POST', body: fd }); navigate('/notes'); } 
    catch (err) { setError(err instanceof Error ? err.message : 'Upload failed'); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up">
      <form onSubmit={onSubmit} className="glass rounded-2xl p-8 space-y-5">
        <h1 className="text-2xl font-bold text-white mb-6">Upload Resource</h1>
        {error && <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">{error}</div>}
        
        <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Title</label><input required value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="e.g. Intro to Computer Science" /></div>
        <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label><textarea required value={description} onChange={e => setDescription(e.target.value)} className="input-field" rows={3} placeholder="Briefly describe the content..." /></div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Type</label>
            <select value={resourceType} onChange={e => setResourceType(e.target.value)} className="input-field bg-slate-900">
              <option value="Notes">Notes</option><option value="Past Paper">Past Paper</option><option value="Study Guide">Study Guide</option>
            </select>
          </div>
          <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Institution</label>
            <select value={institutionId} onChange={e => setInstitutionId(e.target.value)} className="input-field bg-slate-900">
              <option value="">Optional</option>{academic.institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-300 p-3 rounded-lg border border-slate-700 bg-slate-800/50 cursor-pointer">
          <input type="checkbox" checked={isPremium} onChange={e => setIsPremium(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500" /> Mark as Premium Content
        </label>

        <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">File (PDF/DOC)</label><input required type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 file:cursor-pointer" /></div>
        
        <button disabled={busy} className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all">
          {busy ? 'Uploading…' : 'Publish Resource'}
        </button>
      </form>
    </div>
  );
}
