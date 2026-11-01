import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { BookOpen, Search, UploadCloud, Shield, LogOut, User as UserIcon } from 'lucide-react';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onLogout = async () => { await logout(); navigate('/login'); };

  const navLink = (path: string, label: string, Icon: any) => {
    const active = location.pathname.startsWith(path);
    return (
      <Link to={path} className={`flex items-center gap-2 text-sm font-medium transition-colors ${active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}>
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4">
          
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <span>KnowVa</span>
          </Link>

          <nav className="flex flex-1 items-center gap-6">
            {navLink('/notes', 'Browse', Search)}
            {user && navLink('/upload', 'Upload', UploadCloud)}
            {user?.role === 'superadmin' && navLink('/admin', 'Admin', Shield)}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:inline">{user.name}</span>
                </Link>
                <button onClick={onLogout} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" title="Log out">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Log in</Link>
                <Link to="/register" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-12">
        <Outlet />
      </main>
      
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} KnowVa. Built for students.</p>
      </footer>
    </div>
  );
}
