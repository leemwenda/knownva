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
      <h1 className="text-3xl font-bold text-slate-900">Study Planner</h1>
      
      <form onSubmit={onSubmit} className="card p-6 flex gap-4 items-end flex-wrap">
        <div className="flex-1"><label className="text-xs font-bold text-slate-500 uppercase">Title</label><input required value={title} onChange={e=>setTitle(e.target.value)} className="input-field mt-1" placeholder="e.g. Calculus Final Exam" /></div>
        <div><label className="text-xs font-bold text-slate-500 uppercase">Date</label><input required type="date" value={date} onChange={e=>setDate(e.target.value)} className="input-field mt-1" /></div>
        <div><label className="text-xs font-bold text-slate-500 uppercase">Type</label><select value={type} onChange={e=>setType(e.target.value)} className="input-field mt-1"><option value="exam">Exam</option><option value="reminder">Reminder</option><option value="goal">Goal</option></select></div>
        <button type="submit" className="btn-primary h-[42px] px-6"><Plus className="h-5 w-5" /></button>
      </form>

      <div className="space-y-3">
        {items.map(i => (
          <div key={i.id} className="card p-4 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${i.type === 'exam' ? 'bg-red-50 text-red-500' : 'bg-brand-50 text-brand-500'}`}><Calendar className="h-5 w-5" /></div>
            <div className="flex-1"><p className="font-bold text-slate-900">{i.title}</p><p className="text-sm text-slate-500">{new Date(i.date).toLocaleDateString()} · {i.type}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
