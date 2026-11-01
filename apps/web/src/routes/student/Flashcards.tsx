import { useState, useEffect, type FormEvent } from 'react';
import { api } from '../../lib/api';
import { Plus, Trash2, RefreshCw } from 'lucide-react';

export function Flashcards() {
  const [cards, setCards] = useState<any[]>([]);
  const [front, setFront] = useState(''); const [back, setBack] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [flipped, setFlipped] = useState<number | null>(null);

  const load = () => api<{items:any[]}>('/student/flashcards').then(r => setCards(r.items));
  useEffect(() => { load(); }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await api('/student/flashcards', { method: 'POST', body: JSON.stringify({ front, back, deckName: 'General' }) });
    setFront(''); setBack(''); setIsCreating(false); load();
  };

  const del = async (id: number) => { await api(`/student/flashcards/${id}`, { method: 'DELETE' }); load(); };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Flashcards</h1>
        <button onClick={() => setIsCreating(!isCreating)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4"/> New Card</button>
      </div>

      {isCreating && (
        <form onSubmit={onSubmit} className="card p-6 space-y-4 border-brand-200">
          <input required placeholder="Front (Question)" value={front} onChange={e=>setFront(e.target.value)} className="input-field" />
          <textarea required placeholder="Back (Answer)" value={back} onChange={e=>setBack(e.target.value)} className="input-field" rows={2} />
          <button type="submit" className="btn-primary w-full">Save Card</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.id} onClick={() => setFlipped(flipped === c.id ? null : c.id)} className="card p-6 cursor-pointer min-h-[160px] flex flex-col justify-center relative group bg-gradient-to-br from-white to-slate-50">
            {flipped === c.id ? <p className="text-slate-700 whitespace-pre-wrap">{c.back}</p> : <p className="font-bold text-lg text-slate-900">{c.front}</p>}
            <button onClick={(e) => { e.stopPropagation(); del(c.id); }} className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4"/></button>
            <div className="absolute bottom-2 right-2 text-slate-300"><RefreshCw className="h-3 w-3" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
