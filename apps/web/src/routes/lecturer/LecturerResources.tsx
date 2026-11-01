import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { FileText, Clock, CheckCircle, XCircle, Edit } from 'lucide-react';

export function LecturerResources() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{items: any[]}>('/notes?mine=true&status=all').then(res => setNotes(res.items)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-slate-500 dark:text-slate-400">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Resources</h1>
        <Link to="/lecturer/uploads" className="btn-primary">Upload New</Link>
      </div>

      {notes.length === 0 ? (
        <div className="card p-10 text-center border-dashed">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No resources yet</h3>
          <p className="text-slate-500 mb-4 dark:text-slate-400">Upload your first academic document to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(n => (
            <div key={n.id} className="card p-6 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded dark:bg-slate-800 dark:text-slate-400">{n.resourceType}</span>
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${n.status === 'approved' ? 'bg-green-100 text-green-700' : n.status === 'rejected' ? 'bg-red-100 text-red-700' : n.status === 'draft' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700'}`}>
                  {n.status === 'approved' ? <CheckCircle className="h-3 w-3" /> : n.status === 'rejected' ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {n.status}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1 line-clamp-1 dark:text-white">{n.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1 dark:text-slate-400">{n.description}</p>
              
              {n.status === 'rejected' && n.rejectionReason && (
                <div className="bg-red-50 text-red-600 text-xs p-2 rounded mb-4 border border-red-100">
                  <strong>Reason:</strong> {n.rejectionReason}
                </div>
              )}

              {(n.status === 'draft' || n.status === 'rejected') && (
                <Link to={`/lecturer/uploads?edit=${n.id}`} className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-brand-50 text-brand-600 py-2 text-xs font-bold hover:bg-brand-100 transition-colors">
                  <Edit className="h-3 w-3" /> Edit & Resubmit
                </Link>
              )}
              
              <div className="pt-4 border-t border-slate-100 flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 dark:border-slate-800">
                <span>Downloads: {n.downloadsCount}</span>
                <span>Rating: ★ {n.averageRating}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
