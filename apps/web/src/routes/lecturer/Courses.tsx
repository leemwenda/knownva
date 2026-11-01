import { School, Plus, Users, FileText } from 'lucide-react';

export function Courses() {
  const courses = [
    { name: "Database Management Systems", code: "CS301", students: 120, resources: 12 },
    { name: "Operating Systems", code: "CS302", students: 98, resources: 8 },
    { name: "Computer Networks", code: "CS401", students: 85, resources: 15 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1 dark:text-white">My Courses</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage the courses you are teaching.</p>
        </div>
        <button className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4"/> Add Course</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c, i) => (
          <div key={i} className="card p-6 hover:border-brand-300 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><School className="h-6 w-6"/></div>
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded dark:bg-slate-800 dark:text-slate-300">{c.code}</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-4 dark:text-white">{c.name}</h3>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-4 border-t border-slate-100 dark:text-slate-400 dark:border-slate-800">
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4"/> {c.students} Students</span>
              <span className="flex items-center gap-1.5"><FileText className="h-4 w-4"/> {c.resources} Resources</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
