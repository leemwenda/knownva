import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { BookOpen, Search, UploadCloud, Shield, LogOut, LayoutDashboard, Library, Settings } from 'lucide-react';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onLogout = async () => { await logout(); navigate('/login'); };

  const navLink = (path: string, label: string, Icon: any) => {
    const active = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
    return (
      <Link to={path} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
        <Icon className={`h-5 w-5 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
        {label}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold text-brand-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white shadow-sm">
              <BookOpen className="h-4 w-4" />
            </div>
            KnowVa
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">Menu</p>
          {navLink('/dashboard', 'Overview', LayoutDashboard)}
          {navLink('/notes', 'Explore Resources', Search)}
          {navLink('/library', 'My Library', Library)}
          {navLink('/upload', 'Upload Resources', UploadCloud)}

          {user?.role === 'superadmin' && (
            <>
              <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6">Admin</p>
              {navLink('/admin', 'Dashboard', Shield)}
              {navLink('/admin/moderation', 'Moderation', Shield)}
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-100">
          <Link to="/profile" className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 transition-colors">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
            </div>
            <Settings className="h-4 w-4 text-slate-400" />
          </Link>
          <button onClick={onLogout} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 flex md:hidden items-center justify-between px-4 border-b border-slate-200 bg-white">
           <Link to="/dashboard" className="flex items-center gap-2 text-lg font-bold text-brand-900">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-white"><BookOpen className="h-3 w-3" /></div>
            KnowVa
          </Link>
          <button onClick={onLogout} className="text-slate-500"><LogOut className="h-5 w-5" /></button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
