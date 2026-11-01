import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, Download, ShieldCheck } from 'lucide-react';

export function Home() {
  return (
    <div className="flex flex-col items-center pt-10 pb-20 text-center">
      
      <div className="animate-fade-in-up inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300 mb-10 backdrop-blur-md">
        <Sparkles className="mr-2 h-4 w-4" />
        The new standard for academic resources
      </div>
      
      <h1 className="animate-fade-in-up max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-8 leading-[1.1]">
        Master your courses with <br className="hidden sm:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
          curated study notes.
        </span>
      </h1>
      
      <p className="animate-fade-in-up max-w-2xl text-lg text-slate-400 mb-12">
        Access high-quality lecture notes, past papers, and study guides. Written by top students, approved by lecturers.
      </p>

      <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4 mb-24">
        <Link to="/notes" className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 transition-all">
          Explore Resources 
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link to="/register" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-md hover:bg-white/10 transition-colors">
          Create Free Account
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-left">
        {[
          { icon: BookOpen, title: "Curated Library", desc: "Thousands of verified PDFs mapped directly to your institution's curriculum.", color: "text-indigo-400", bg: "bg-indigo-400/10" },
          { icon: Download, title: "Offline Access", desc: "Download notes instantly and study anywhere, anytime without internet.", color: "text-purple-400", bg: "bg-purple-400/10" },
          { icon: ShieldCheck, title: "Moderated Quality", desc: "Every upload is reviewed by our team of experts to ensure absolute accuracy.", color: "text-cyan-400", bg: "bg-cyan-400/10" }
        ].map((f, i) => (
          <div key={i} className="glass rounded-3xl p-8 hover:bg-slate-800/50 transition-colors duration-300 group">
            <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${f.bg} ${f.color} group-hover:scale-110 transition-transform`}>
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-white">{f.title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
