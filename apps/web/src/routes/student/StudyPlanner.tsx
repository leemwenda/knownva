import { useState, useEffect, type FormEvent } from 'react';
import { api } from '../../lib/api';
import { Calendar, Plus, Clock, Trash2 } from 'lucide-react';

export function StudyPlanner() {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState(''); const [date, setDate] = useState(''); const [type, setType] = useState('exam');

  const load = () => api<{items:any[]}>('/student/planner').then(r => setItems(r.items));
  useEffect(() => { load(); }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await api('/student/planner', { method: 'POST', body: JSON.stringify({ title, date, type }) });
    setTitle(''); load();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Study Planner</h1>
        <p className="text-slate-500 dark:text-slate-400">Organize exams, reminders, and study goals.</p>
      </div>

      <form onSubmit={onSubmit} className="card p-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Title</label>
          <input required value={title} onChange={e=>setTitle(e.target.value)} className="input-field mt-1" placeholder="e.g. Calculus Final Exam" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Date</label>
          <input required type="date" value={date} onChange={e=>setDate(e.target.value)} className="input-field mt-1" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Type</label>
          <select value={type} onChange={e=>setType(e.target.value)} className="input-field mt-1 bg-white dark:bg-slate-900">
            <option value="exam">Exam</option>
            <option value="reminder">Reminder</option>
            <option value="goal">Goal</option>
          </select>
        </div>
        <button type="submit" className="btn-primary h-[42px] px-4"><Plus className="h-5 w-5" /></button>
      </form>

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="card p-12 text-center border-dashed border-2 border-slate-200 dark:border-white/10">
            <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No items yet. Add your first exam above.</p>
          </div>
        )}
        {items.map(i => (
          <div key={i.id} className="card p-4 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${i.type === 'exam' ? 'bg-red-50 dark:bg-red-500/15 text-red-500 dark:text-red-400' : 'bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400'}`}>
              <Calendar className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-900 dark:text-white">{i.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(i.date).toLocaleDateString()} · {i.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
