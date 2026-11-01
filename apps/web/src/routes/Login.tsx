import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { refresh } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await refresh();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit}
      className="mx-auto max-w-sm space-y-4 rounded bg-white p-6 shadow">
      <h1 className="text-xl font-semibold">Log in</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input required type="email" placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded border px-3 py-2" />
      <input required type="password" placeholder="Password" value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded border px-3 py-2" />
      <button disabled={busy}
        className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
        {busy ? 'Logging in…' : 'Log in'}
      </button>
      <p className="text-sm text-slate-600">
        No account? <Link to="/register" className="text-blue-600">Sign up</Link>
      </p>
    </form>
  );
}
