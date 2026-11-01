import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Download, Star, FileText } from 'lucide-react';

export function LecturerAnalytics() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{items: any[]}>('/notes?mine=true').then(res => setNotes(res.items)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-slate-500">Loading...</div>;

  const totalDownloads = notes.reduce((acc, n) => acc + n.downloadsCount, 0);
  const totalApproved = notes.filter(n => n.status === 'approved').length;
  const avgRating = notes.length > 0 ? (notes.reduce((acc, n) => acc + n.averageRating, 0) / notes.length).toFixed(1) : '0.0';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-slate-900">Analytics & Impact</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 text-brand-500 mb-2"><Download className="h-5 w-5" /><h3 className="font-bold text-slate-600">Total Downloads</h3></div>
          <p className="text-4xl font-extrabold text-slate-900">{totalDownloads}</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-2 text-indigo-500 mb-2"><FileText className="h-5 w-5" /><h3 className="font-bold text-slate-600">Approved Resources</h3></div>
          <p className="text-4xl font-extrabold text-slate-900">{totalApproved}</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-2 text-amber-500 mb-2"><Star className="h-5 w-5" /><h3 className="font-bold text-slate-600">Average Rating</h3></div>
          <p className="text-4xl font-extrabold text-slate-900">{avgRating} <span className="text-lg text-slate-400 font-medium">/ 5.0</span></p>
        </div>
      </div>
    </div>
  );
}
