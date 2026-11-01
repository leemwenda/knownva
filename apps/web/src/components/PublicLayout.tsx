import { Link, Outlet } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-brand-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white shadow-sm">
              <BookOpen className="h-4 w-4" />
            </div>
            KnowVa
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <Link to="/notes" className="hover:text-brand-500">Explore Resources</Link>
            <a href="#" className="hover:text-brand-500">AI Study Assistant</a>
            <a href="#" className="hover:text-brand-500">For Lecturers</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-brand-500">Sign in</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
    </div>
  );
}
