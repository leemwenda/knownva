import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { PlayCircle, X, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

const QUIZ_STYLES = [
  { bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600', shape: 'bg-white/20' },
  { bg: 'bg-cyan-500', hover: 'hover:bg-cyan-600', shape: 'bg-white/20' },
  { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', shape: 'bg-white/20' },
  { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600', shape: 'bg-white/20' },
  { bg: 'bg-rose-500', hover: 'hover:bg-rose-600', shape: 'bg-white/20' },
];

export function Quizzes() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeQuiz, setActiveQuiz] = useState<any[] | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api<{ items: any[] }>('/ai/quizzes');
      setQuestions(Array.isArray(res.items) ? res.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Group questions by documentId to create "Quizzes"
  const quizzes = questions.reduce((acc, q) => {
    const dId = q.documentId || 0;
    if (!acc[dId]) acc[dId] = [];
    acc[dId].push(q);
    return acc;
  }, {} as Record<number, any[]>);

  const quizIds = Object.keys(quizzes);

  const handleSubmit = () => {
    let correct = 0;
    activeQuiz?.forEach((q: any) => {
      if (selectedAnswers[q.id] === q.correctIndex) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  // ── VIEW: TAKING A QUIZ ──
  if (activeQuiz) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-12">
        <button onClick={() => { setActiveQuiz(null); setSelectedAnswers({}); setSubmitted(false); }} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-500 transition-colors dark:text-slate-400">
          <X className="h-4 w-4"/> Exit Quiz
        </button>

        {submitted && (
          <div className="card p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-emerald-900/20 dark:to-green-900/20 dark:border-emerald-800">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-green-900 dark:text-green-100 mb-2">Quiz Completed!</h2>
            <p className="text-lg text-green-800 dark:text-green-200">You scored <span className="font-bold">{score}</span> out of {activeQuiz.length}</p>
          </div>
        )}

        <div className="space-y-6">
          {activeQuiz.map((q: any, index: number) => {
            const isSelected = selectedAnswers[q.id] !== undefined;
            const isCorrect = selectedAnswers[q.id] === q.correctIndex;
            return (
              <div key={q.id} className={`card p-6 md:p-8 border-2 transition-colors ${submitted ? (isCorrect ? 'border-green-500' : 'border-red-500') : 'border-transparent'}`}>
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                    <span className="text-brand-500 mr-2">{index + 1}.</span> {q.question}
                  </h3>
                  {submitted && (
                    <span className={`text-xs font-bold px-2 py-1 rounded ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  )}
                </div>
                
                <div className="space-y-3">
                  {q.options.map((opt: string, i: number) => {
                    const isOptSelected = selectedAnswers[q.id] === i;
                    const isOptCorrect = q.correctIndex === i;
                    let bgClass = "bg-slate-50 dark:bg-[#1A1A1A] border-slate-200 dark:border-white/10 hover:border-brand-500";
                    
                    if (submitted) {
                      if (isOptCorrect) bgClass = "bg-green-50 dark:bg-green-900/20 border-green-500";
                      else if (isOptSelected && !isOptCorrect) bgClass = "bg-red-50 dark:bg-red-900/20 border-red-500";
                      else bgClass = "bg-slate-50 dark:bg-[#1A1A1A] border-slate-200 dark:border-white/10 opacity-50";
                    } else if (isOptSelected) {
                      bgClass = "bg-brand-50 dark:bg-brand-900/20 border-brand-500";
                    }

                    return (
                      <button key={i} disabled={submitted} onClick={() => setSelectedAnswers(prev => ({...prev, [q.id]: i}))}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-slate-700 dark:text-slate-200 ${bgClass}`}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                
                {submitted && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-sm">
                    <span className="font-bold text-blue-800 dark:text-blue-300">Explanation: </span>
                    <span className="text-blue-700 dark:text-blue-200">{q.explanation || "No explanation provided."}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!submitted && (
          <button onClick={handleSubmit} disabled={Object.keys(selectedAnswers).length !== activeQuiz.length} className="btn-primary w-full py-4 text-base shadow-lg">
            Submit Answers
          </button>
        )}
      </div>
    );
  }

  // ── VIEW: QUIZ CARDS (Image 2 Inspired) ──
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Practice Quizzes</h1>
          <p className="text-slate-500 dark:text-slate-400">Test your knowledge with AI-generated questions.</p>
        </div>
      </div>

      {loading && <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div></div>}

      {error && (
        <div className="card p-8 text-center border-red-200 bg-red-50">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-medium mb-3">{error}</p>
          <button onClick={load} className="btn-primary">Retry</button>
        </div>
      )}

      {!loading && !error && quizIds.length === 0 && (
        <div className="card p-16 text-center border-dashed border-2 dark:border-white/10">
          <AlertCircle className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No quizzes available</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">Upload a document in the AI Assistant and generate a study pack to create quizzes.</p>
        </div>
      )}

      {!loading && !error && quizIds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizIds.map((docId, index) => {
            const quizQuestions = quizzes[Number(docId)];
            const style = QUIZ_STYLES[index % QUIZ_STYLES.length];
            return (
              <div key={docId} onClick={() => setActiveQuiz(quizQuestions)}
                className={`relative overflow-hidden rounded-3xl p-6 h-56 cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-2xl ${style.bg} ${style.hover}`}>
                
                {/* Abstract Shapes */}
                <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${style.shape}`}></div>
                <div className={`absolute right-6 top-12 w-20 h-20 rounded-2xl ${style.shape} rotate-12`}></div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-wider mb-2">
                    <PlayCircle className="h-4 w-4" /> Practice Quiz
                  </div>
                  <h2 className="text-xl font-extrabold text-white mb-1 line-clamp-2">
                    Document #{docId} Quiz
                  </h2>
                  <p className="text-sm font-medium text-white/80">{quizQuestions.length} Questions</p>
                  
                  <div className="mt-auto flex items-center gap-2 text-white font-bold text-sm">
                    Start Quiz <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
