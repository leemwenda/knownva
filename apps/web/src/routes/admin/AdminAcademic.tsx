import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../../lib/api';
import { Plus, School, BookOpen, Layers } from 'lucide-react';

export function AdminAcademic() {
  const [data, setData] = useState<any>({ institutions: [], fields: [], levels: [] });
  const [loading, setLoading] = useState(true);

  // Form states
  const [instName, setInstName] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [levelName, setLevelName] = useState('');

  const load = () => {
    api('/academic/structure').then((res: any) => setData(res)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const createEntity = async (type: string, name: string, setter: any) => {
    if (!name) return;
    try {
      await api(`/academic/${type}`, { method: 'POST', body: JSON.stringify({ name }) });
      setter('');
      load();
    } catch (err) { alert('Failed to create'); }
  };

  if (loading) return <div className="p-10 text-slate-500 dark:text-slate-400">Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-1 dark:text-white">Academic Structure</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage global institutions, fields of study, and levels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Institutions */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center gap-2 text-brand-600 mb-4"><School className="h-5 w-5" /><h3 className="font-bold text-lg text-slate-900 dark:text-white">Institutions</h3></div>
          <form onSubmit={(e) => { e.preventDefault(); createEntity('institutions', instName, setInstName); }} className="flex gap-2 mb-4">
            <input value={instName} onChange={e => setInstName(e.target.value)} placeholder="Add institution..." className="input-field flex-1" />
            <button type="submit" className="btn-primary px-3"><Plus className="h-4 w-4" /></button>
          </form>
          <ul className="space-y-2 flex-1 overflow-y-auto max-h-64">
            {data.institutions.map((i:any) => <li key={i.id} className="text-sm font-medium text-slate-700 bg-slate-50 p-2 rounded-lg dark:bg-slate-900 dark:text-slate-200">{i.name}</li>)}
          </ul>
        </div>

        {/* Fields */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center gap-2 text-indigo-600 mb-4"><BookOpen className="h-5 w-5" /><h3 className="font-bold text-lg text-slate-900 dark:text-white">Fields</h3></div>
          <form onSubmit={(e) => { e.preventDefault(); createEntity('fields', fieldName, setFieldName); }} className="flex gap-2 mb-4">
            <input value={fieldName} onChange={e => setFieldName(e.target.value)} placeholder="e.g. Computer Science" className="input-field flex-1" />
            <button type="submit" className="btn-primary px-3 bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4" /></button>
          </form>
          <ul className="space-y-2 flex-1 overflow-y-auto max-h-64">
            {data.fields.map((f:any) => <li key={f.id} className="text-sm font-medium text-slate-700 bg-slate-50 p-2 rounded-lg dark:bg-slate-900 dark:text-slate-200">{f.name}</li>)}
          </ul>
        </div>

        {/* Levels */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center gap-2 text-cyan-600 mb-4"><Layers className="h-5 w-5" /><h3 className="font-bold text-lg text-slate-900 dark:text-white">Levels</h3></div>
          <form onSubmit={(e) => { e.preventDefault(); createEntity('levels', levelName, setLevelName); }} className="flex gap-2 mb-4">
            <input value={levelName} onChange={e => setLevelName(e.target.value)} placeholder="e.g. Year 1" className="input-field flex-1" />
            <button type="submit" className="btn-primary px-3 bg-cyan-600 hover:bg-cyan-700"><Plus className="h-4 w-4" /></button>
          </form>
          <ul className="space-y-2 flex-1 overflow-y-auto max-h-64">
            {data.levels.map((l:any) => <li key={l.id} className="text-sm font-medium text-slate-700 bg-slate-50 p-2 rounded-lg dark:bg-slate-900 dark:text-slate-200">{l.name}</li>)}
          </ul>
        </div>

      </div>
    </div>
  );
}
