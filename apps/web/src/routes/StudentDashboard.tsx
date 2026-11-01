import { useAuth } from '../lib/auth';
import { Link } from 'react-router-dom';
import { Search, Sparkles, BookOpen, Clock, ChevronRight } from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Good morning, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500">Your academic workspace at a glance.</p>
        </div>
        <Link to="/notes" className="btn-primary flex items-center gap-2">
          <Search className="h-4 w-4" /> Explore Resources
        </Link>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Saved Notes</h3>
            <div className="p-2 bg-brand-50 rounded-lg text-brand-500"><BookOpen className="h-5 w-5" /></div>
          </div>
          <p className="text-4xl font-bold text-slate-900">24</p>
          <p className="text-sm text-slate-500 mt-2">Across 5 subjects</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Study Progress</h3>
            <div className="p-2 bg-cyan-50 rounded-lg text-cyan-500"><Clock className="h-5 w-5" /></div>
          </div>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold text-slate-900">72%</p>
            <p className="text-sm font-medium text-cyan-600 mb-1">On track</p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4">
            <div className="bg-cyan-500 h-2 rounded-full w-[72%]"></div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Upcoming Exams</h3>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-500"><Clock className="h-5 w-5" /></div>
          </div>
          <p className="text-4xl font-bold text-slate-900">2</p>
          <p className="text-sm text-slate-500 mt-2">Next in 14 days</p>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-brand-900 p-8 text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-brand-500 opacity-20 blur-3xl"></div>
        <div className="relative z-10 md:w-2/3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4 text-cyan-300" /> AI Study Assistant
          </div>
          <h2 className="text-2xl font-bold mb-2">Struggling with a concept?</h2>
          <p className="text-brand-100 mb-6">Ask anything about your notes, upload a PDF, or generate study materials instantly.</p>
          <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-sm border border-white/20">
            <input type="text" placeholder="Ask a question..." className="flex-1 bg-transparent px-4 text-sm text-white placeholder-brand-200 outline-none" />
            <button className="bg-brand-500 hover:bg-brand-400 p-2 rounded-lg transition-colors"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
          <Link to="/notes" className="text-sm font-medium text-brand-500 hover:text-brand-600">View All →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           {/* Placeholder Cards */}
           {[1, 2, 3].map(i => (
             <Link to="/notes" key={i} className="card p-5 hover:border-brand-300 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><BookOpen className="h-4 w-4" /></div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Computer Science</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-1 group-hover:text-brand-500 transition-colors">Database Management Systems</h3>
                <p className="text-sm text-slate-500">Chapter 4: Normalization</p>
             </Link>
           ))}
        </div>
      </div>
    </div>
  );
}
