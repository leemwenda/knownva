import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
      <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 mb-6">
        <Construction className="h-12 w-12" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2 dark:text-white">{title}</h1>
      <p className="text-slate-500 mb-8 max-w-md text-center dark:text-slate-400">This module is currently under development. Our engineering team is working hard to bring this feature to life.</p>
      <Link to="/dashboard" className="flex items-center gap-2 text-brand-600 font-bold hover:underline"><ArrowLeft className="h-4 w-4"/> Back to Dashboard</Link>
    </div>
  );
}
