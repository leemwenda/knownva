import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { UserPlus, ArrowRight } from 'lucide-react';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { refresh } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setError(null);
    try {
      await api('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
      await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      await refresh(); navigate('/dashboard');
    } catch (err) { setError(err instanceof Error ? err.message : 'Registration failed'); } 
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-md w-full pt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="card p-10">
        <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
          <UserPlus className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 text-center mb-2 tracking-tight">Create an account</h1>
        <p className="text-center text-slate-500 mb-8">Join thousands of students learning better.</p>
        
        {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 text-center font-medium">{error}</div>}
        
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@university.edu" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Min 8 characters" />
          </div>
          <button disabled={busy} className="btn-primary group mt-4 w-full flex items-center justify-center gap-2 py-3.5 text-base">
            {busy ? 'Creating account…' : 'Create account'}
            {!busy && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Log in</Link>
        </p>
      </div>
    </div>
  );
}
