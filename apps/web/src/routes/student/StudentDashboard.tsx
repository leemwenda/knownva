import { Link } from 'react-router-dom';
import { Search, Sparkles, Clock, FileText, ChevronRight, BookOpen, Layers } from 'lucide-react';
import { useAuth } from '../../lib/auth';

const quickActions = [
  {
    title: "Explore Library",
    desc: "Find lecture notes and past papers from top students.",
    lightBg: "bg-[#FDE6D2]", lightText: "text-[#8B5E3C]",
    darkBg: "dark:bg-orange-500/15", darkText: "dark:text-orange-200",
    icon: Search, path: "/student/explore"
  },
  {
    title: "AI Study Assistant",
    desc: "Upload documents and generate smart study packs.",
    lightBg: "bg-[#E6DDF5]", lightText: "text-[#6B5B95]",
    darkBg: "dark:bg-purple-500/15", darkText: "dark:text-purple-200",
    icon: Sparkles, path: "/student/ai"
  },
  {
    title: "Study Planner",
    desc: "Organize your exams and keep track of your goals.",
    lightBg: "bg-[#D9F0DF]", lightText: "text-[#3C8A50]",
    darkBg: "dark:bg-emerald-500/15", darkText: "dark:text-emerald-200",
    icon: Clock, path: "/student/planner"
  },
  {
    title: "My Notes",
    desc: "Review your personal summaries and bookmarks.",
    lightBg: "bg-[#E6F0FA]", lightText: "text-[#4A7AB5]",
    darkBg: "dark:bg-blue-500/15", darkText: "dark:text-blue-200",
    icon: FileText, path: "/student/library"
  },
];

export function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            Good morning, {user?.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Your academic workspace is ready.</p>
        </div>
      </div>

      {/* Pastel cards (light) / tinted-glass cards (dark) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {quickActions.map((card, i) => (
          <Link key={i} to={card.path}
            className={`relative overflow-hidden rounded-3xl p-6 md:p-8 h-56 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl border
              ${card.lightBg} ${card.lightText} ${card.darkBg} ${card.darkText}
              border-transparent dark:border-white/10`}>
            {/* Abstract shapes */}
            <div className={`absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-30 dark:opacity-20 bg-current blur-2xl`}></div>
            <div className={`absolute right-4 bottom-4 w-24 h-24 rounded-2xl opacity-10 dark:opacity-10 bg-current rotate-12`}></div>

            <div className="z-10 relative">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4`}>
                <card.icon className="h-4 w-4" /> Action
              </div>
              <h2 className="text-2xl font-extrabold mb-2">{card.title}</h2>
              <p className="text-sm max-w-xs opacity-80 leading-relaxed">{card.desc}</p>
            </div>

            <div className="z-10 flex items-center gap-2 text-sm font-bold mt-auto">
              Go to section <ChevronRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>

      {/* Continue Learning */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Continue Learning</h2>
        <div className="card p-6">
          <div className="flex items-center justify-between text-sm font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-3 mb-3">
            <span>Resource</span>
            <span>Type</span>
          </div>
          <div className="space-y-4">
            <Link to="/student/explore" className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-300 rounded-lg"><BookOpen className="h-4 w-4"/></div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-brand-500 transition-colors">Database Management Systems</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Added recently</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">Notes</span>
            </Link>
            <Link to="/student/flashcards" className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-500 dark:text-purple-300 rounded-lg"><Layers className="h-4 w-4"/></div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-brand-500 transition-colors">Biology Chapter 1 Flashcards</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">12 cards</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">Study</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
