import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { Menu } from 'lucide-react';

interface LayoutProps { title: string; theme: 'purple' | 'indigo' | 'slate'; items: any[]; }

export function LayoutWrapper({ title, theme, items }: LayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#F8FAFC]">
      <Sidebar title={title} theme={theme} items={items} isOpen={isOpen} onClose={() => setIsOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Topbar */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <span className="font-bold text-slate-900">{title}</span>
          <button onClick={() => setIsOpen(true)} className="p-2 bg-slate-100 rounded-lg text-slate-600"><Menu className="h-5 w-5" /></button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}
