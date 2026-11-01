import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { BookOpen, Search, UploadCloud, Shield, LogOut, User as UserIcon, Bookmark } from 'lucide-react';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onLogout = async () => { await logout(); navigate('/login'); };

  const navLink = (path: string, label: string, Icon: any) => {
    const active = location.pathname.startsWith(path);
    return (
      <Link to={path} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${active ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  };

  return (
    <div className="app-bg flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <BookOpen className="h-4 w-4" />
            </div>
            <span>KnowVa</span>
          </Link>

          <nav className="flex flex-1 items-center gap-2">
            {navLink('/notes', 'Explore', Search)}
            {user && navLink('/library', 'Library', Bookmark)}
            {user && navLink('/upload', 'Upload', UploadCloud)}
            {user?.role === 'superadmin' && navLink('/admin', 'Admin', Shield)}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-indigo-400">
                    <UserIcon className="h-3.5 w-3.5" />
                  </div>
                  <span className="hidden sm:inline">{user.name}</span>
                </Link>
                <button onClick={onLogout} className="rounded-full p-2 text-slate-500 hover:bg-slate-800 hover:text-red-400 transition-colors" title="Log out">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Log in</Link>
                <Link to="/register" className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <Outlet />
      </main>
      
      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} KnowVa. Elevate your learning.</p>
      </footer>
    </div>
  );
}
