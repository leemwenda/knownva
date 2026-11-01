import { BookOpen, Play } from 'lucide-react';

export function Quizzes() {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Practice Quizzes</h1>
      <p className="text-slate-500">Test your knowledge with AI-generated quizzes from your notes.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 border-brand-200 bg-gradient-to-br from-white to-brand-50">
          <div className="p-3 bg-brand-100 text-brand-600 rounded-xl w-fit mb-4"><BookOpen className="h-6 w-6"/></div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Generate New Quiz</h3>
          <p className="text-sm text-slate-500 mb-4">Upload a document or select from your library to generate a 10-question quiz.</p>
          <button className="btn-primary w-full flex items-center justify-center gap-2"><Play className="h-4 w-4"/> Start Generator</button>
        </div>
      </div>
    </div>
  );
}
