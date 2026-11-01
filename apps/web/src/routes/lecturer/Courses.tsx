import { School, Plus } from 'lucide-react';

export function Courses() {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">My Courses</h1>
        <button className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4"/> Add Course</button>
      </div>
      <div className="card p-10 text-center border-dashed">
        <School className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">No courses assigned</h3>
        <p className="text-slate-500">Once an admin assigns you to a course, it will appear here.</p>
      </div>
    </div>
  );
}
