import { Link } from 'react-router-dom';
import { FileText, Clock, Download, TrendingUp, ChevronRight, UploadCloud } from 'lucide-react';
import { useAuth } from '../../lib/auth';

const pastelCards = [
  { title: "Upload Notes", desc: "Share lecture materials and study guides with your students.", color: "bg-[#FDE6D2]", text: "text-[#8B5E3C]", icon: UploadCloud, path: "/lecturer/uploads" },
  { title: "Create Exam", desc: "Draft and publish past papers for upcoming assessments.", color: "bg-[#E8E8E8]", text: "text-[#5A5A5A]", icon: FileText, path: "/lecturer/uploads" },
  { title: "View Drafts", desc: "Finish your unpublished resources before submitting.", color: "bg-[#E6DDF5]", text: "text-[#6B5B95]", icon: Clock, path: "/lecturer/drafts" },
  { title: "My Analytics", desc: "Track downloads and student engagement on your materials.", color: "bg-[#D9F0DF]", text: "text-[#3C8A50]", icon: TrendingUp, path: "/lecturer/analytics" },
];

export function LecturerDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Welcome, Dr. {user?.name.split(' ')[1] || user?.name}</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your academic content and track engagement.</p>
        </div>
      </div>

      {/* Image 2 Inspired Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pastelCards.map((card, i) => (
          <Link key={i} to={card.path} className={`relative overflow-hidden rounded-3xl p-8 h-64 flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-xl ${card.color} dark:bg-opacity-10`}>
             {/* Abstract Shapes */}
             <div className={`absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-30 ${card.text} blur-2xl`}></div>
             <div className={`absolute right-0 bottom-0 w-32 h-32 rounded-tl-[100px] opacity-20 ${card.text}`}></div>
             
             <div className="z-10">
               <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 backdrop-blur-md text-xs font-bold uppercase tracking-wider ${card.text} mb-4`}>
                 <card.icon className="h-4 w-4" /> Action
               </div>
               <h2 className={`text-2xl font-extrabold mb-2 ${card.text}`}>{card.title}</h2>
               <p className={`text-sm max-w-xs ${card.text} opacity-80`}>{card.desc}</p>
             </div>

             <div className={`z-10 flex items-center gap-2 text-sm font-bold ${card.text} mt-auto`}>
               Go to section <ChevronRight className="h-4 w-4" />
             </div>
          </Link>
        ))}
      </div>

      {/* Recent Uploads Table (Responsive) */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="card p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
           <div className="flex items-center justify-between text-sm font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3 dark:text-slate-400">
             <span>Resource</span>
             <span>Status</span>
           </div>
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-500 rounded-lg"><FileText className="h-4 w-4"/></div>
                  <div><p className="font-bold text-slate-900 dark:text-white text-sm">Advanced Databases</p><p className="text-xs text-slate-500 dark:text-slate-400">Uploaded Apr 20, 2025</p></div>
                </div>
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">Pending</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><FileText className="h-4 w-4"/></div>
                  <div><p className="font-bold text-slate-900 dark:text-white text-sm">Operating Systems</p><p className="text-xs text-slate-500 dark:text-slate-400">Uploaded Apr 18, 2025</p></div>
                </div>
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">Published</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
