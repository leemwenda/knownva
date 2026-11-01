import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

interface AcademicData {
  institutions: { id: number; name: string }[];
  fields: { id: number; name: string }[];
  levels: { id: number; name: string }[];
}

export function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [academic, setAcademic] = useState<AcademicData>({ institutions: [], fields: [], levels: [] });
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('Notes');
  const [isPremium, setIsPremium] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const [institutionId, setInstitutionId] = useState('');
  const [fieldId, setFieldId] = useState('');
  const [levelId, setLevelId] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ ok: true } & AcademicData>('/academic/structure')
      .then((res) => setAcademic(res))
      .catch(() => {});
  }, []);

  if (user?.role !== 'lecturer' && user?.role !== 'superadmin') {
    return <p className="text-red-600">Only lecturers can upload resources.</p>;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please select a file'); return; }
    
    setBusy(true); setError(null);
    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', description);
    fd.append('resourceType', resourceType);
    fd.append('isPremium', String(isPremium));
    fd.append('confirmedOwnership', 'true');
    if (institutionId) fd.append('institutionId', institutionId);
    if (fieldId) fd.append('fieldId', fieldId);
    if (levelId) fd.append('levelId', levelId);
    fd.append('file', file);

    try {
      await api('/notes', { method: 'POST', body: fd });
      navigate('/notes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-4 rounded bg-white p-6 shadow">
      <h1 className="text-xl font-semibold">Upload Resource</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      
      <input required placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded border px-3 py-2" />
      <textarea required placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded border px-3 py-2" rows={3} />
      
      <select value={resourceType} onChange={e => setResourceType(e.target.value)} className="w-full rounded border px-3 py-2">
        <option value="Notes">Notes</option>
        <option value="Past Paper">Past Paper</option>
        <option value="Study Guide">Study Guide</option>
      </select>
      
      <div className="flex gap-4">
        <select value={institutionId} onChange={e => setInstitutionId(e.target.value)} className="w-full rounded border px-3 py-2">
          <option value="">Institution (optional)</option>
          {academic.institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <select value={fieldId} onChange={e => setFieldId(e.target.value)} className="w-full rounded border px-3 py-2">
          <option value="">Field (optional)</option>
          {academic.fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select value={levelId} onChange={e => setLevelId(e.target.value)} className="w-full rounded border px-3 py-2">
          <option value="">Level (optional)</option>
          {academic.levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isPremium} onChange={e => setIsPremium(e.target.checked)} />
        Premium Content
      </label>

      <input required type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full rounded border px-3 py-2" />
      
      <button disabled={busy} className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
        {busy ? 'Uploading…' : 'Upload'}
      </button>
    </form>
  );
}
