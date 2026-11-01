import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { User, School, BookOpen, Save, Bell, Shield } from 'lucide-react';

export function Profile() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [institution, setInstitution] = useState(user?.institution ?? '');
  const [fieldOfStudy, setFieldOfStudy] = useState(user?.fieldOfStudy ?? '');
  const [msg, setMsg] = useState<string | null>(null);

  if (!user) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api('/users/me', { method: 'PATCH', body: JSON.stringify({ name, bio, institution, fieldOfStudy }) }); await refresh(); setMsg('Saved!'); } 
    catch (err) { setMsg('Failed to save'); }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-slate-900 mb-6 dark:text-white">Your Profile</h1>
      {msg && <div className="mb-4 p-3 bg-brand-50 text-brand-600 rounded-xl text-sm font-bold">{msg}</div>}
      <form onSubmit={onSubmit} className="card p-8 space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="h-20 w-20 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-2xl font-bold">{user.name.charAt(0)}</div>
          <div><p className="text-lg font-bold text-slate-900 dark:text-white">{user.email}</p><p className="text-sm font-semibold text-brand-500 uppercase">{user.role}</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div><label className="text-xs font-bold text-slate-500 uppercase dark:text-slate-400">Name</label><input value={name} onChange={e=>setName(e.target.value)} className="input-field mt-1" /></div>
          <div><label className="text-xs font-bold text-slate-500 uppercase dark:text-slate-400">Institution</label><input value={institution} onChange={e=>setInstitution(e.target.value)} className="input-field mt-1" /></div>
        </div>
        <div><label className="text-xs font-bold text-slate-500 uppercase dark:text-slate-400">Field of Study</label><input value={fieldOfStudy} onChange={e=>setFieldOfStudy(e.target.value)} className="input-field mt-1" /></div>
        <div><label className="text-xs font-bold text-slate-500 uppercase dark:text-slate-400">Bio</label><textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3} className="input-field mt-1" /></div>
        <button className="btn-primary w-full py-3.5 flex justify-center items-center gap-2"><Save className="h-4 w-4"/> Save Profile</button>
      </form>
    </div>
  );
}

export function Settings() {
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-slate-900 mb-6 dark:text-white">Settings</h1>
      <div className="card p-8 space-y-6">
        <div className="flex items-center gap-3 text-slate-700 font-bold border-b border-slate-100 pb-4 dark:text-slate-200 dark:border-slate-800"><Shield className="h-5 w-5 text-brand-500"/> Security</div>
        <button className="input-field text-left font-medium">Change Password</button>
        <button className="input-field text-left font-medium">Enable Two-Factor Authentication</button>
        <div className="flex items-center gap-3 text-slate-700 font-bold border-b border-slate-100 pb-4 pt-6 dark:text-slate-200 dark:border-slate-800"><Bell className="h-5 w-5 text-brand-500"/> Notifications</div>
        <label className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-500 dark:border-slate-600" defaultChecked /> Email me when my uploads are approved.</label>
        <label className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-500 dark:border-slate-600" defaultChecked /> Email me study reminders.</label>
      </div>
    </div>
  );
}

export function Notifications() {
  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-slate-900 mb-6 dark:text-white">Notifications</h1>
      <div className="card p-10 text-center border-dashed">
        <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">You're all caught up!</h3>
        <p className="text-slate-500 dark:text-slate-400">No new notifications right now.</p>
      </div>
    </div>
  );
}
