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

  if (!user) return <p>Please log in.</p>;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ name, bio, institution, fieldOfStudy }),
      });
      await refresh();
      setMsg('Saved');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit}
      className="mx-auto max-w-lg space-y-4 rounded bg-white p-6 shadow">
      <h1 className="text-xl font-semibold">Your profile</h1>
      <p className="text-sm text-slate-500">{user.email} · {user.role}</p>
      {msg && <p className="text-sm text-blue-600">{msg}</p>}
      <input value={name} onChange={(e) => setName(e.target.value)}
        className="w-full rounded border px-3 py-2" placeholder="Name" />
      <input value={institution} onChange={(e) => setInstitution(e.target.value)}
        className="w-full rounded border px-3 py-2" placeholder="Institution" />
      <input value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)}
        className="w-full rounded border px-3 py-2" placeholder="Field of study" />
      <textarea value={bio} onChange={(e) => setBio(e.target.value)}
        rows={4} placeholder="Short bio"
        className="w-full rounded border px-3 py-2" />
      <button disabled={busy}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
        {busy ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}
