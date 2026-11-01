import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { LogOut, X } from 'lucide-react';

export function Sidebar({ title, items, isOpen, onClose }: { title: string, items: any[], isOpen: boolean, onClose: () => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
    // Full reset to guarantee landing page even if any state is stale
    setTimeout(() => { if (window.location.pathname !== '/') window.location.href = '/'; }, 100);
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />}

      {/* overflow-hidden prevents any bleed-through from scrolling content */}
      <aside className={`w-64 flex-shrink-0 flex flex-col h-[100dvh] fixed md:static inset-y-0 left-0 z-50 overflow-hidden
        bg-white dark:bg-[#0A0D1A]/95
        border-r border-slate-200 dark:border-white/5
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

        {/* Header */}
        <div className="h-16 flex-none flex items-center justify-between px-6 border-b border-slate-100 dark:border-white/5">
          <span className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-brand-500/30">
              K
            </div>
            {title.split(' ')[1] || title}
          </span>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="h-5 w-5"/>
          </button>
        </div>

        {/* Nav — flex-1 min-h-0 prevents it from growing past available space */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
          {items.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} onClick={onClose}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
                }`}>
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-brand-500 shadow-[0_0_10px_rgba(139,127,240,0.7)]" />
                )}
                <item.icon className={`h-4 w-4 flex-none ${active ? 'text-brand-500 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section — flex-none, isolated, no overlap possible */}
        <div className="flex-none p-3 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#0A0D1A] relative z-10">
          {user && (
            <Link to="/student/profile" className="flex items-center gap-2.5 px-2 py-2 mb-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <div className="h-9 w-9 flex-none rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{user.role}</p>
              </div>
            </Link>
          )}
          <button onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200
              dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10
              transition-colors">
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
