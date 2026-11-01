import { useState, type FormEvent } from 'react';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { User, School, BookOpen, Save, FileText } from 'lucide-react';

export function Profile() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [institution, setInstitution] = useState(user?.institution ?? '');
  const [fieldOfStudy, setFieldOfStudy] = useState(user?.fieldOfStudy ?? '');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return <p className="text-slate-500 dark:text-slate-400">Please log in.</p>;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg(null);
    try { await api('/users/me', { method: 'PATCH', body: JSON.stringify({ name, bio, institution, fieldOfStudy }) }); await refresh(); setMsg('Profile updated successfully'); } 
    catch (err) { setMsg(err instanceof Error ? err.message : 'Save failed'); } finally { setBusy(false); }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1 dark:text-white">Academic Profile</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your personal information and study details.</p>
      </div>

      <form onSubmit={onSubmit} className="card p-8 space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="h-20 w-20 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-2xl font-bold shadow-inner">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{user.email}</p>
            <p className="text-sm font-semibold text-brand-500 uppercase tracking-wide">{user.role}</p>
          </div>
        </div>

        {msg && <div className="rounded-xl bg-brand-50 p-4 text-sm font-medium text-brand-700 border border-brand-100">{msg}</div>}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 dark:text-slate-200"><User className="h-4 w-4 text-slate-400 dark:text-slate-500"/> Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 dark:text-slate-200"><School className="h-4 w-4 text-slate-400 dark:text-slate-500"/> Institution</label>
            <input value={institution} onChange={(e) => setInstitution(e.target.value)} className="input-field" placeholder="e.g. University of Nairobi" />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 dark:text-slate-200"><BookOpen className="h-4 w-4 text-slate-400 dark:text-slate-500"/> Field of Study</label>
          <input value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} className="input-field" placeholder="e.g. Computer Science" />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 dark:text-slate-200"><FileText className="h-4 w-4 text-slate-400 dark:text-slate-500"/> Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="input-field" placeholder="Tell us a bit about yourself..." />
        </div>
        
        <button disabled={busy} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
          <Save className="h-4 w-4" /> {busy ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
