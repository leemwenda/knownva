import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { Menu, Search, Bell, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../lib/theme';

export function LayoutWrapper({ title, items }: { title: string, items: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-transparent">
      <Sidebar title={title} items={items} isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="topbar h-16 flex items-center justify-between px-6 shrink-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 transition-colors duration-500">
          
          <div className="flex items-center gap-4">
            <button onClick={() => setIsOpen(true)} className="md:hidden p-2 text-slate-600 dark:text-slate-300"><Menu className="h-5 w-5"/></button>
            <div className="hidden md:flex items-center bg-slate-100/50 dark:bg-white/5 rounded-full px-4 py-2 w-80 border border-slate-200/50 dark:border-white/5">
              <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 mr-2" />
              <input type="text" placeholder="Search resources, notes..." className="bg-transparent border-none outline-none text-sm w-full placeholder-slate-400 text-slate-800 dark:text-white" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggle} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full relative transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0A0A0A]"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-md ml-2">
              {user?.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-[1200px] mx-auto w-full relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
