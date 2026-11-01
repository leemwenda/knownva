import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { LogOut, Settings, X } from 'lucide-react';

interface NavItem { path: string; label: string; icon: any; }
interface SidebarProps { title: string; items: NavItem[]; theme: 'purple' | 'indigo' | 'slate'; isOpen: boolean; onClose: () => void; }

export function Sidebar({ title, items, theme, isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Using full static strings so Tailwind definitely compiles them
  const themeStyles = {
    purple: { active: 'bg-brand-50 text-brand-600 border-brand-200', avatar: 'bg-brand-100 text-brand-600' },
    indigo: { active: 'bg-indigo-50 text-indigo-600 border-indigo-200', avatar: 'bg-indigo-100 text-indigo-600' },
    slate:  { active: 'bg-slate-100 text-slate-800 border-slate-300',   avatar: 'bg-slate-200 text-slate-800' }
  };
  const activeStyle = themeStyles[theme].active;
  const avatarStyle = themeStyles[theme].avatar;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm" onClick={onClose} />}

      <aside className={`w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-[100dvh] fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</span>
          <button onClick={onClose} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><X className="h-5 w-5"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {items.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} onClick={onClose} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${active ? activeStyle : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'}`}>
                <item.icon className={`h-5 w-5 ${active ? '' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 rounded-xl p-2 mb-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bold ${avatarStyle}`}>
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
