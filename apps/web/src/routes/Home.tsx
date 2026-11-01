import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, Shield, GraduationCap } from 'lucide-react';

export function Home() {
  return (
    <div className="flex flex-col">
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-32 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-600 mb-6">
            <Sparkles className="h-4 w-4" /> Your Intelligent Academic Workspace
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
            Everything you need to <span className="text-brand-500">learn smarter.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-lg">
            Access academic resources, organize your notes, and use intelligent AI tools to understand your coursework and prepare for examinations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register" className="btn-primary flex items-center justify-center gap-2 text-base py-3 px-6">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              Explore Resources
            </Link>
          </div>
          
          <div className="mt-12 flex items-center gap-6 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-brand-500" /> Secure & Reliable</div>
            <div className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-brand-500" /> Built for Education</div>
          </div>
        </div>

        {/* Abstract Product Preview */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-100 to-cyan-50 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
          <div className="card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="h-3 w-3 rounded-full bg-red-400"></div>
              <div className="h-3 w-3 rounded-full bg-amber-400"></div>
              <div className="h-3 w-3 rounded-full bg-green-400"></div>
              <div className="ml-4 h-6 w-48 bg-slate-100 rounded-md"></div>
            </div>
            <div className="space-y-4">
              <div className="h-8 w-1/2 bg-slate-200 rounded-md"></div>
              <div className="h-4 w-full bg-slate-100 rounded-md"></div>
              <div className="h-4 w-5/6 bg-slate-100 rounded-md"></div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="card p-4 bg-brand-50 border-brand-100">
                  <BookOpen className="h-6 w-6 text-brand-500 mb-2" />
                  <div className="h-4 w-20 bg-brand-200 rounded mb-2"></div>
                  <div className="h-3 w-12 bg-brand-200 rounded"></div>
                </div>
                <div className="card p-4">
                  <Sparkles className="h-6 w-6 text-brand-500 mb-2" />
                  <div className="h-4 w-20 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 w-12 bg-slate-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
