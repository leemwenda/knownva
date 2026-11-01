import { useState, type FormEvent } from 'react';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

export function Profile() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [institution, setInstitution] = useState(user?.institution ?? '');
  const [fieldOfStudy, setFieldOfStudy] = useState(user?.fieldOfStudy ?? '');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return <p className="text-slate-400">Please log in.</p>;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg(null);
    try { await api('/users/me', { method: 'PATCH', body: JSON.stringify({ name, bio, institution, fieldOfStudy }) }); await refresh(); setMsg('Saved successfully'); } 
    catch (err) { setMsg(err instanceof Error ? err.message : 'Save failed'); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-xl animate-fade-in-up">
      <form onSubmit={onSubmit} className="glass space-y-5 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Your Profile</h1>
        <p className="text-sm text-slate-400 mb-6">{user.email} · <span className="uppercase tracking-wider font-bold text-indigo-400">{user.role}</span></p>
        {msg && <div className="rounded-lg bg-indigo-500/10 p-3 text-sm text-indigo-400 border border-indigo-500/20">{msg}</div>}
        
        <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Full Name</label><input value={name} onChange={(e) => setName(e.target.value)} className="input-field" /></div>
        <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Institution</label><input value={institution} onChange={(e) => setInstitution(e.target.value)} className="input-field" /></div>
        <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Field of Study</label><input value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} className="input-field" /></div>
        <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Bio</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="input-field" /></div>
        
        <button disabled={busy} className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all mt-4">
          {busy ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
