import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, FileText, Layers, PlayCircle, MessageSquare, Clock, BookOpen, Zap } from 'lucide-react';

export function Home() {
  return (
    <div className="relative overflow-hidden">

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-32 lg:pt-24 lg:pb-40 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Ambient glow behind text */}
        <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-gradient-to-br from-brand-400/25 via-purple-400/15 to-cyan-400/20 blur-[120px] rounded-full -z-10 animate-pulse-glow" />
        <div className="absolute top-0 right-10 w-[400px] h-[400px] bg-amber-300/15 blur-[100px] rounded-full -z-10" />

        <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.05s' }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-white/70 backdrop-blur-md px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-600 mb-8 shadow-sm">
            <Sparkles className="h-4 w-4" /> Your AI-Powered Study Workspace
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.03] text-[#0A1F1F] mb-6">
            Master your courses <br className="hidden md:block" />
            with <span className="text-gradient">intelligent</span> tools.
          </h1>

          <p className="text-lg md:text-xl text-[#0A1F1F]/60 leading-relaxed max-w-lg mb-10">
            Upload your lecture notes, generate flashcards, and prepare for exams with an AI that actually understands your coursework.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="group inline-flex items-center gap-2 rounded-full bg-[#0F3D3E] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#0F3D3E]/30 hover:bg-[#0A2E2F] hover:-translate-y-0.5 transition-all">
              Start studying free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#how-it-works" className="inline-flex items-center gap-2 rounded-full border border-[#0A1F1F]/15 bg-white/70 backdrop-blur-md px-8 py-4 text-base font-bold text-[#0A1F1F] hover:bg-white transition-all">
              See how it works
            </a>
          </div>

          <p className="text-xs font-medium text-[#0A1F1F]/40 mt-6">Works with PDF, DOCX, and TXT files.</p>
        </div>

        {/* Floating cards */}
        <div className="relative h-[520px] hidden lg:block">
          {/* main card */}
          <div className="glass-light rounded-3xl p-6 absolute top-10 left-10 w-[400px] animate-float z-20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                  <Sparkles className="h-5 w-5"/>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0A1F1F]">AI Study Pack</p>
                  <p className="text-xs text-[#0A1F1F]/50">Chapter 1 · Biology</p>
                </div>
              </div>
              <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">Ready</span>
            </div>
            <div className="space-y-2.5">
              <div className="h-2.5 w-full bg-[#0A1F1F]/8 rounded-full" />
              <div className="h-2.5 w-4/5 bg-[#0A1F1F]/8 rounded-full" />
              <div className="h-2.5 w-2/3 bg-[#0A1F1F]/8 rounded-full" />
            </div>
            <div className="mt-5 flex gap-2">
              <span className="px-2 py-1 rounded-md bg-brand-100 text-brand-700 text-[10px] font-bold">10 flashcards</span>
              <span className="px-2 py-1 rounded-md bg-cyan-100 text-cyan-700 text-[10px] font-bold">5-question quiz</span>
            </div>
          </div>

          {/* flashcard back */}
          <div className="glass-light rounded-2xl p-6 absolute top-0 right-0 w-[280px] animate-float-delayed z-10">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white mb-3 shadow-lg shadow-amber-500/30">
              <Layers className="h-4 w-4"/>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#0A1F1F]/50 mb-1">Flashcard</p>
            <p className="text-sm font-bold text-[#0A1F1F] leading-snug mb-2">What is a derivative?</p>
            <p className="text-xs text-[#0A1F1F]/60 leading-relaxed">A measure of how a function changes as its input changes.</p>
          </div>

          {/* quiz card */}
          <div className="glass-light rounded-2xl p-5 absolute bottom-6 right-10 w-[300px] animate-float z-30 border-brand-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                <PlayCircle className="h-3.5 w-3.5"/>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#0A1F1F]/50">Practice Quiz</p>
            </div>
            <div className="space-y-2">
              <div className="rounded-lg bg-[#0A1F1F]/[0.03] border border-[#0A1F1F]/5 px-3 py-2 text-xs text-[#0A1F1F]/70">A) Velocity</div>
              <div className="rounded-lg bg-brand-50 border-2 border-brand-500 px-3 py-2 text-xs font-bold text-brand-700">B) Rate of change</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section id="how-it-works" className="relative py-24 border-y border-[#E8E4D8]/60 bg-white/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-600 mb-3">How it works</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A1F1F] mb-4">From PDF to passing in 3 steps.</h2>
            <p className="text-lg text-[#0A1F1F]/60 max-w-2xl mx-auto">No more hours rewriting notes. Let AI do the heavy lifting.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Upload your material', desc: 'Drop in a PDF, Word doc, or text file. We support all standard formats.', icon: BookOpen, color: 'from-brand-500 to-purple-600', bg: 'bg-brand-100', textColor: 'text-brand-700' },
              { step: '02', title: 'Generate study pack', desc: 'Our AI reads the text and instantly writes summaries, flashcards, and quizzes.', icon: Zap, color: 'from-amber-400 to-orange-500', bg: 'bg-amber-100', textColor: 'text-amber-700' },
              { step: '03', title: 'Practice & Master', desc: 'Review cards, take quizzes, and ask follow-up questions until it clicks.', icon: MessageSquare, color: 'from-cyan-400 to-blue-500', bg: 'bg-cyan-100', textColor: 'text-cyan-700' },
            ].map((item, i) => (
              <div key={i} className="glass-light p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-all">
                <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${item.bg} blur-2xl opacity-60 group-hover:scale-125 transition-transform`} />
                <div className={`relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white mb-6 shadow-lg`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <p className={`text-[10px] font-black ${item.textColor} tracking-widest uppercase mb-2`}>Step {item.step}</p>
                <h3 className="text-xl font-bold text-[#0A1F1F] mb-3">{item.title}</h3>
                <p className="text-sm text-[#0A1F1F]/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-600 mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A1F1F]">Everything you need.<br/>Nothing you don't.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Smart Summaries', desc: 'Turn 50 pages of lecture notes into 5 pages of pure gold.', icon: BookOpen, color: 'bg-brand-100 text-brand-700' },
              { title: 'AI Flashcards', desc: 'Automatically generated decks that actually explain the concepts.', icon: Layers, color: 'bg-amber-100 text-amber-700' },
              { title: 'Practice Quizzes', desc: 'Test yourself with AI-generated multiple-choice questions.', icon: PlayCircle, color: 'bg-purple-100 text-purple-700' },
              { title: 'Document Chat', desc: 'Ask any question about your PDF and get an answer instantly.', icon: MessageSquare, color: 'bg-pink-100 text-pink-700' },
              { title: 'Study Planner', desc: 'Auto-scheduled revision sessions based on your exam dates.', icon: Clock, color: 'bg-cyan-100 text-cyan-700' },
              { title: 'Shared Library', desc: 'Access thousands of notes shared by students across the country.', icon: FileText, color: 'bg-emerald-100 text-emerald-700' },
            ].map((f, i) => (
              <div key={i} className="glass-light p-6 rounded-2xl hover:-translate-y-1 transition-all">
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.color} mb-4`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0A1F1F] mb-1.5">{f.title}</h3>
                <p className="text-sm text-[#0A1F1F]/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FLASHCARD SHOWCASE ═══════════════════ */}
      <section className="py-24 bg-white/40 border-y border-[#E8E4D8]/60">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-600 mb-3">Flashcards that explain</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A1F1F] mb-6 leading-tight">
              Short question on the front. A real answer on the back.
            </h2>
            <p className="text-lg text-[#0A1F1F]/60 leading-relaxed">
              Most flashcards give you one line and leave you guessing. KnowVa writes full explanations, so each card actually teaches the concept instead of just testing it.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-amber-300/30 to-brand-400/30 rounded-3xl blur-2xl" />
            <div className="relative glass-light rounded-3xl p-8 md:p-10 animate-float">
              <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700 mb-5">Computer Networks</span>
              <h3 className="text-2xl font-black text-[#0A1F1F] mb-5 leading-snug">What does the network layer do?</h3>
              <p className="text-base text-[#0A1F1F]/70 leading-relaxed mb-6">
                It moves packets from a source host to a destination host across one or more networks. It does this by choosing a path using logical addresses, which is why routers operate here.
              </p>
              <div className="flex gap-1.5">
                <div className="h-7 w-7 rounded-full bg-brand-200" />
                <div className="h-7 w-7 rounded-full bg-brand-300" />
                <div className="h-7 w-7 rounded-full bg-brand-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="px-6 py-24 pb-32">
        <div className="mx-auto max-w-6xl rounded-[2.5rem] bg-gradient-to-br from-brand-500 via-purple-600 to-[#0F3D3E] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-brand-500/40">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl" />

          <h2 className="relative text-4xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
            Your next exam starts <br className="hidden md:block"/> with your next upload.
          </h2>
          <p className="relative text-lg text-white/80 mb-10 max-w-xl mx-auto">
            Join thousands of students who are studying smarter, not harder.
          </p>
          <Link to="/register" className="relative inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-brand-700 shadow-xl hover:scale-105 transition-transform">
            Create your free account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
