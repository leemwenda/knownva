import { Link, Outlet } from 'react-router-dom';
import { BookOpen, Menu, X, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { useState } from 'react';

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#FAF8F2] text-[#0A1F1F] flex flex-col">
      <header className="sticky top-0 z-50 border-b border-[#E8E4D8]/60 bg-[#FAF8F2]/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5 text-xl font-extrabold text-[#0A1F1F]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F3D3E] text-white shadow-lg shadow-[#0F3D3E]/30">
              <BookOpen className="h-4 w-4" />
            </div>
            KnowVa
          </Link>
          <nav className="hidden md:flex gap-10 text-sm font-semibold text-[#0A1F1F]/70">
            <a href="#how-it-works" className="hover:text-[#0F3D3E] transition-colors">How it works</a>
            <a href="#features" className="hover:text-[#0F3D3E] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#0F3D3E] transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden md:block text-sm font-semibold text-[#0A1F1F]/70 hover:text-[#0F3D3E]">
              Sign in
            </Link>
            <Link to="/register" className="rounded-full bg-[#0F3D3E] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#0F3D3E]/30 hover:bg-[#0A2E2F] transition-all">
              Get Started
            </Link>
            <button onClick={() => setOpen(!open)} className="md:hidden p-2">
              {open ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden border-t border-[#E8E4D8] bg-[#FAF8F2] px-6 py-4 space-y-3">
            <a href="#how-it-works" onClick={() => setOpen(false)} className="block text-sm font-medium">How it works</a>
            <a href="#features" onClick={() => setOpen(false)} className="block text-sm font-medium">Features</a>
            <Link to="/login" onClick={() => setOpen(false)} className="block text-sm font-medium">Sign in</Link>
          </div>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      {/* ═══════════════════ PREMIUM FOOTER ═══════════════════ */}
      <footer className="relative bg-[#0A2E2F] text-white overflow-hidden">
        {/* Glow accents */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-brand-500/20 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full translate-y-1/2 pointer-events-none" />

        {/* Top section — main footer content */}
        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-14">

            {/* Brand column (wider) */}
            <div className="md:col-span-5">
              <Link to="/" className="flex items-center gap-2.5 text-xl font-extrabold text-white mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#0F3D3E]">
                  <BookOpen className="h-4 w-4" />
                </div>
                KnowVa
              </Link>
              <p className="text-sm text-white/60 leading-relaxed max-w-sm mb-6">
                The intelligent study workspace for students. Turn any document into notes, flashcards, and quizzes — powered by AI that actually understands your coursework.
              </p>

              {/* Social icons */}
              <div className="flex gap-2">
                {[
                  { icon: Twitter, href: '#', label: 'Twitter' },
                  { icon: Github, href: '#', label: 'GitHub' },
                  { icon: Linkedin, href: '#', label: 'LinkedIn' },
                  { icon: Mail, href: '#', label: 'Email' },
                ].map(({ icon: Icon, href, label }) => (
                  <a key={label} href={href} aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product column */}
            <div className="md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="text-white/70 hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-white/70 hover:text-white transition-colors">How it works</a></li>
                <li><a href="#pricing" className="text-white/70 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>

            {/* Resources column */}
            <div className="md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Study guides</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>

            {/* Company column */}
            <div className="md:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">About us</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Press kit</a></li>
              </ul>
            </div>
          </div>

          {/* Newsletter mini-CTA */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 mb-12">
            <div className="flex-1 text-center md:text-left">
              <h5 className="text-lg font-bold text-white mb-1">Get study tips in your inbox</h5>
              <p className="text-sm text-white/60">One short email a week. No spam, unsubscribe anytime.</p>
            </div>
            <form className="flex w-full md:w-auto gap-2" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="you@university.edu"
                className="flex-1 md:w-64 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/30 focus:bg-white/10 transition-colors" />
              <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#0A2E2F] hover:bg-white/90 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>

          {/* Bottom bar — legal + credits */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} KnowVa. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-white/40">
              <a href="#" className="hover:text-white/70 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white/70 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white/70 transition-colors">Cookies</a>
            </div>
            <p className="text-xs text-white/40">Built in Nairobi, Kenya 🇰🇪</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
