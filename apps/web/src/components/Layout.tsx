import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <Link to="/" className="text-lg font-bold">KnowVa</Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/notes" className="hover:text-blue-600">Browse</Link>
            {user && <Link to="/profile" className="hover:text-blue-600">Profile</Link>}
            {user?.role === 'superadmin' && <span className="text-slate-400">Admin</span>}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="text-slate-600">{user.name}</span>
                <button onClick={onLogout}
                  className="rounded bg-slate-200 px-3 py-1 hover:bg-slate-300">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-600">Log in</Link>
                <Link to="/register"
                  className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
