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

  if (user?.role !== 'lecturer' && user?.role !== 'superadmin') return <p className="text-red-500 font-semibold p-10">Only lecturers can upload resources.</p>;

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
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Upload Resource</h1>
        <p className="text-slate-500">Share your academic materials with the community. All uploads are reviewed before publishing.</p>
      </div>

      <form onSubmit={onSubmit} className="card p-8 space-y-6">
        {error && <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">{error}</div>}
        
        <div><label className="block text-sm font-bold text-slate-700 mb-2">Title</label><input required value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="e.g. Introduction to Computer Science" /></div>
        <div><label className="block text-sm font-bold text-slate-700 mb-2">Description</label><textarea required value={description} onChange={e => setDescription(e.target.value)} className="input-field" rows={3} placeholder="Briefly describe what this resource covers..." /></div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
            <select value={resourceType} onChange={e => setResourceType(e.target.value)} className="input-field bg-white">
              <option value="Notes">Notes</option><option value="Past Paper">Past Paper</option><option value="Study Guide">Study Guide</option>
            </select>
          </div>
          <div><label className="block text-sm font-bold text-slate-700 mb-2">Institution</label>
            <select value={institutionId} onChange={e => setInstitutionId(e.target.value)} className="input-field bg-white">
              <option value="">Optional</option>{academic.institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-bold text-slate-700 mb-2">Level</label>
            <select value={levelId} onChange={e => setLevelId(e.target.value)} className="input-field bg-white">
              <option value="">Optional</option>{academic.levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-700 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
          <input type="checkbox" checked={isPremium} onChange={e => setIsPremium(e.target.checked)} className="h-5 w-5 rounded border-slate-300 text-brand-500 focus:ring-brand-500" /> Mark as Premium Content
        </label>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">File (PDF / DOC)</label>
          <input required type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 file:cursor-pointer transition-all" />
        </div>
        
        <button disabled={busy} className="btn-primary w-full py-4 text-base flex justify-center items-center gap-2">
          <UploadCloud className="h-5 w-5" /> {busy ? 'Uploading…' : 'Submit for Review'}
        </button>
      </form>
    </div>
  );
}
