import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { UploadCloud, FileText, CheckCircle, Clock, ChevronRight } from 'lucide-react';

export function LecturerDashboard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ items: any[] }>('/notes?mine=true&status=all')
      .then(res => setNotes(res.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div></div>;

  const pending = notes.filter(n => n.status === 'pending').length;
  const approved = notes.filter(n => n.status === 'approved').length;
  const drafts = notes.filter(n => n.status === 'draft').length;
  const totalDownloads = notes.reduce((acc, n) => acc + n.downloadsCount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Lecturer Workspace</h1>
          <p className="text-slate-500">Welcome back, {user?.name}. Manage your academic materials here.</p>
        </div>
        <Link to="/lecturer/uploads" className="btn-primary flex items-center gap-2"><UploadCloud className="h-5 w-5"/> Upload New</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="text-slate-400 mb-2"><FileText className="h-5 w-5"/></div>
          <p className="text-sm font-bold text-slate-500">Total Uploads</p>
          <p className="text-3xl font-extrabold text-slate-900">{notes.length}</p>
        </div>
        <div className="card p-6">
          <div className="text-amber-500 mb-2"><Clock className="h-5 w-5"/></div>
          <p className="text-sm font-bold text-slate-500">Pending Review</p>
          <p className="text-3xl font-extrabold text-slate-900">{pending}</p>
        </div>
        <div className="card p-6">
          <div className="text-green-500 mb-2"><CheckCircle className="h-5 w-5"/></div>
          <p className="text-sm font-bold text-slate-500">Approved</p>
          <p className="text-3xl font-extrabold text-slate-900">{approved}</p>
        </div>
        <div className="card p-6">
          <div className="text-indigo-500 mb-2"><UploadCloud className="h-5 w-5"/></div>
          <p className="text-sm font-bold text-slate-500">Downloads</p>
          <p className="text-3xl font-extrabold text-slate-900">{totalDownloads}</p>
        </div>
      </div>

      {drafts > 0 && (
        <div className="card p-6 border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-amber-800">You have {drafts} unsaved draft(s)</h3>
            <p className="text-sm text-amber-600">Finish them and submit for review.</p>
          </div>
          <Link to="/lecturer/drafts" className="rounded-xl bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800 hover:bg-amber-200 transition-colors">View Drafts</Link>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4 mt-8">
          <h2 className="text-xl font-bold text-slate-900">Recent Submissions</h2>
          <Link to="/lecturer/resources" className="text-sm font-medium text-brand-500 hover:text-brand-600 flex items-center gap-1">View All <ChevronRight className="h-4 w-4"/></Link>
        </div>
        
        {notes.length === 0 ? (
          <div className="card p-10 text-center border-dashed">
             <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
             <p className="text-slate-500">You haven't uploaded any resources yet.</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr><th className="px-6 py-3">Title</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Downloads</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notes.slice(0, 4).map(n => (
                  <tr key={n.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-800">{n.title}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${n.status === 'approved' ? 'bg-green-100 text-green-700' : n.status === 'rejected' ? 'bg-red-100 text-red-700' : n.status === 'draft' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>{n.status}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{n.downloadsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
