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
    <div className="mx-auto max-w-md w-full pt-12 animate-fade-in-up">
      <div className="glass rounded-[2rem] p-10">
        <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
          <UserPlus className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white text-center mb-2 tracking-tight">Create an account</h1>
        <p className="text-center text-slate-400 mb-8">Join thousands of students learning better.</p>
        
        {error && <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20 text-center font-medium">{error}</div>}
        
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600" placeholder="you@university.edu" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600" placeholder="Min 8 characters" />
          </div>
          <button disabled={busy} className="group mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-slate-200 disabled:opacity-50 transition-all">
            {busy ? 'Creating account…' : 'Create account'}
            {!busy && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="font-semibold text-white hover:text-cyan-300 transition-colors">Log in</Link>
        </p>
      </div>
    </div>
  );
}
