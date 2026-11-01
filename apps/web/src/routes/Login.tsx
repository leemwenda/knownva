import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { LogIn } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { refresh } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setError(null);
    try {
      await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      await refresh(); navigate('/');
    } catch (err) { setError(err instanceof Error ? err.message : 'Login failed'); } 
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-md w-full pt-10">
      <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <LogIn className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Welcome back</h1>
        <p className="text-center text-slate-500 mb-8">Log in to access your saved notes.</p>
        
        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>}
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="you@university.edu" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="••••••••" />
          </div>
          <button disabled={busy} className="mt-2 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all">
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account? <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
