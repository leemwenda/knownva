import { Link } from 'react-router-dom';
import { ArrowRight, BookMarked, Download, GraduationCap } from 'lucide-react';

export function Home() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 mb-8">
        <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
        The #1 Study Resource Platform
      </div>
      
      <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
        Study smarter, not harder with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">KnowVa</span>
      </h1>
      
      <p className="max-w-2xl text-lg text-slate-600 mb-10">
        Access thousands of lecture notes, past papers, and study guides uploaded by top students and lecturers.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-20">
        <Link to="/notes" className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-0.5">
          Browse Resources <ArrowRight className="h-5 w-5" />
        </Link>
        <Link to="/register" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
          Create Free Account
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl text-left">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <BookMarked className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-bold">Curated Notes</h3>
          <p className="text-slate-600 text-sm">High-quality, admin-approved materials for your specific course.</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Download className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-bold">Offline Access</h3>
          <p className="text-slate-600 text-sm">Download PDFs to your device and study anytime, anywhere.</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-bold">Top Contributors</h3>
          <p className="text-slate-600 text-sm">Learn directly from the best lecturers and peer mentors.</p>
        </div>
      </div>
    </div>
  );
}
