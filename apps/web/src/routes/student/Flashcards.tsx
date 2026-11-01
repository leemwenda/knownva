import { useState, useEffect, type FormEvent } from 'react';
import { api } from '../../lib/api';
import { Plus, Layers, X, ChevronLeft, AlertCircle, Trash2 } from 'lucide-react';

const DECK_STYLES = [
  { bg: 'bg-purple-500', hover: 'hover:bg-purple-600' },
  { bg: 'bg-orange-500', hover: 'hover:bg-orange-600' },
  { bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
  { bg: 'bg-pink-500', hover: 'hover:bg-pink-600' },
  { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
  { bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600' },
];

const NOTE_STYLES = [
  { card: 'bg-orange-50 border-orange-200', text: 'text-orange-900', sub: 'text-orange-700', pin: 'bg-orange-500' },
  { card: 'bg-purple-50 border-purple-200', text: 'text-purple-900', sub: 'text-purple-700', pin: 'bg-purple-500' },
  { card: 'bg-green-50 border-green-200', text: 'text-green-900', sub: 'text-green-700', pin: 'bg-green-500' },
  { card: 'bg-blue-50 border-blue-200', text: 'text-blue-900', sub: 'text-blue-700', pin: 'bg-blue-500' },
];

export function Flashcards() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [deckName, setDeckName] = useState('General');
  const [activeDeck, setActiveDeck] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api<{ items: any[] }>('/student/flashcards');
      setCards(Array.isArray(res.items) ? res.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api('/student/flashcards', {
        method: 'POST',
        body: JSON.stringify({ front, back, deckName: deckName || 'General' })
      });
      setFront(''); setBack(''); setIsCreating(false); load();
    } catch (err) {
      alert('Failed to save card: ' + (err instanceof Error ? err.message : 'unknown error'));
    }
  };

  const del = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this card?')) return;
    try {
      await api(`/student/flashcards/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  // Group cards by deckName — defensive
  const decks: Record<string, any[]> = {};
  for (const card of cards) {
    if (!card || typeof card !== 'object') continue;
    const d = (card.deckName && String(card.deckName).trim()) || 'General';
    if (!decks[d]) decks[d] = [];
    decks[d].push(card);
  }

  const deckNames = Object.keys(decks);

  // ── Sticky Note View (Image 1) ──
  if (activeDeck) {
    const deckCards = decks[activeDeck] || [];
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in slide-in-from-right-8 duration-500">
        <button
          onClick={() => setActiveDeck(null)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-500 transition-colors dark:text-slate-400"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Decks
        </button>

        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">{activeDeck}</h1>
          <p className="text-slate-500 mt-2 dark:text-slate-400">{deckCards.length} study cards</p>
        </div>

        <div className="relative">
          {/* Dashed connecting line on desktop */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-slate-300 dark:border-slate-700 -z-10 hidden md:block"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            {deckCards.map((card, i) => {
              const isLeft = i % 2 === 0;
              const style = NOTE_STYLES[i % NOTE_STYLES.length];
              return (
                <div
                  key={card.id}
                  className={`relative ${isLeft ? 'md:mr-6 md:rotate-2' : 'md:ml-6 md:-rotate-2'} transition-transform hover:rotate-0 hover:scale-105 duration-300`}
                >
                  {/* Pin */}
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full ${style.pin} shadow-md border-2 border-white z-10 hidden md:block`}></div>

                  <div className={`rounded-2xl p-6 md:p-8 shadow-xl border-2 ${style.card} min-h-[180px] flex flex-col`}>
                    <p className={`text-xs font-extrabold uppercase tracking-widest ${style.sub} opacity-70 mb-3`}>
                      Card {i + 1}
                    </p>
                    <h3 className={`text-lg md:text-xl font-bold mb-4 leading-tight ${style.text}`}>
                      {card.front || '(No question)'}
                    </h3>
                    <div className={`mt-auto pt-4 border-t border-black/10`}>
                      <p className={`text-sm font-medium ${style.text} opacity-90 whitespace-pre-wrap`}>
                        {card.back || '(No answer)'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => del(card.id, e)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/50 hover:bg-white text-slate-400 hover:text-red-500 transition-colors opacity-0 hover:opacity-100 dark:text-slate-500"
                      title="Delete card"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Deck Folders View (Image 3) ──
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Study Decks</h1>
          <p className="text-slate-500 dark:text-slate-400">Organized by topic for easier learning.</p>
        </div>
        <button onClick={() => setIsCreating(!isCreating)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Card
        </button>
      </div>

      {isCreating && (
        <form onSubmit={onSubmit} className="card p-6 space-y-4 border-brand-200 dark:border-brand-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 dark:text-slate-400">Deck Name</label>
              <input required placeholder="e.g. Biology 101" value={deckName} onChange={e=>setDeckName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 dark:text-slate-400">Question (Front)</label>
              <input required placeholder="What is..." value={front} onChange={e=>setFront(e.target.value)} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 dark:text-slate-400">Answer (Back)</label>
            <textarea required placeholder="The answer is..." value={back} onChange={e=>setBack(e.target.value)} className="input-field" rows={2} />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">Save Card</button>
            <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
        </div>
      )}

      {error && (
        <div className="card p-8 text-center border-red-200 bg-red-50">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-medium mb-3">{error}</p>
          <button onClick={load} className="btn-primary">Retry</button>
        </div>
      )}

      {!loading && !error && deckNames.length === 0 && (
        <div className="card p-16 text-center border-dashed border-2 dark:border-white/10">
          <Layers className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No decks yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">Create a card or generate a study pack from the AI Assistant.</p>
        </div>
      )}

      {!loading && !error && deckNames.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {deckNames.map((name, index) => {
            const deck = decks[name];
            const style = DECK_STYLES[index % DECK_STYLES.length];
            return (
              <div
                key={name}
                onClick={() => setActiveDeck(name)}
                className={`relative overflow-hidden rounded-3xl p-6 h-52 cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-2xl ${style.bg} ${style.hover}`}
              >
                {/* Abstract shapes */}
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20"></div>
                <div className="absolute right-6 top-12 w-20 h-20 rounded-2xl bg-white/20 rotate-12"></div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-wider mb-2">
                    <Layers className="h-4 w-4" /> Topic
                  </div>
                  <h2 className="text-xl font-extrabold text-white mb-1 line-clamp-2">{name}</h2>
                  <p className="text-sm font-medium text-white/80">{deck.length} {deck.length === 1 ? 'card' : 'cards'}</p>
                  <div className="mt-auto flex items-center gap-2 text-white font-bold text-sm">
                    Study now <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
