import { useEffect, useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Download, ChevronLeft, Star, FileText, Bookmark } from 'lucide-react';

interface Detail { id: number; title: string; description: string; resourceType: string; isPremium: boolean; averageRating: number; ratingCount: number; downloadsCount: number; uploader: { id: number; name: string } | null; }
interface Review { id: number; rating: number; comment: string; user: { name: string }; }

export function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [note, setNote] = useState<Detail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');

  const loadNote = () => {
    if (!id) return;
    api<{ ok: true; note: Detail }>(`/notes/${id}`).then(res => { setNote(res.note); document.title = `${res.note.title} - KnowVa`; }).catch(err => setError(err.message));
    api<{ items: Review[] }>(`/notes/${id}/reviews`).then(res => setReviews(res.items)).catch(() => {});
    api(`/notes/${id}/view`, { method: 'POST' }).catch(() => {});
  };

  useEffect(() => { loadNote(); }, [id]);

  const download = () => { window.open(`/api/v1/notes/${id}/download`, '_blank'); };

  const toggleBookmark = async () => {
    if (!user) return alert('Please log in to bookmark');
    try {
      if (isBookmarked) await api(`/bookmarks/${id}`, { method: 'DELETE' });
      else await api(`/bookmarks/${id}`, { method: 'POST' });
      setIsBookmarked(!isBookmarked);
    } catch (err) { alert('Failed to bookmark'); }
  };

  const submitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Please log in to review');
    try { await api(`/notes/${id}/review`, { method: 'POST', body: JSON.stringify({ rating, comment }) }); setReviewMsg('Review submitted!'); setComment(''); loadNote(); } catch (err) { setReviewMsg('Failed to submit review'); }
  };

  if (error) return <p className="text-red-500">{error}</p>;
  if (!note) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div></div>;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <Link to="/notes" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand-500 transition-colors"><ChevronLeft className="h-4 w-4" /> Back to library</Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <article className="lg:col-span-2 card p-8 sm:p-10 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-brand-600 uppercase bg-brand-50 px-3 py-1.5 rounded-lg"><FileText className="h-4 w-4" /> {note.resourceType}</div>
            {note.isPremium && <span className="rounded-full bg-amber-100 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-700 uppercase">Premium</span>}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">{note.title}</h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">{note.description}</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-6 border-y border-slate-100 mb-8">
            <div><dt className="text-xs font-bold text-slate-400 uppercase mb-1">Uploader</dt><dd className="text-sm font-semibold text-slate-900">{note.uploader?.name ?? '—'}</dd></div>
            <div><dt className="text-xs font-bold text-slate-400 uppercase mb-1">Rating</dt><dd className="text-sm font-semibold text-slate-900 flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400"/> {note.averageRating} ({note.ratingCount})</dd></div>
            <div><dt className="text-xs font-bold text-slate-400 uppercase mb-1">Downloads</dt><dd className="text-sm font-semibold text-slate-900">{note.downloadsCount}</dd></div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={download} className="btn-primary flex flex-1 items-center justify-center gap-2 py-3.5 text-base">
              <Download className="h-5 w-5" /> Download Resource
            </button>
            <button onClick={toggleBookmark} className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold border transition-all ${isBookmarked ? 'bg-brand-50 border-brand-200 text-brand-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-brand-500 text-brand-500' : ''}`} /> {isBookmarked ? 'Saved' : 'Save'}
            </button>
          </div>
        </article>

        <aside className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-slate-900 mb-4">Leave a Review</h3>
            {reviewMsg && <p className="text-xs text-brand-500 mb-2 font-medium">{reviewMsg}</p>}
            <form onSubmit={submitReview} className="space-y-4">
              <select value={rating} onChange={e => setRating(Number(e.target.value))} className="input-field cursor-pointer">
                <option value="5">★★★★★ (5/5)</option>
                <option value="4">★★★★☆ (4/5)</option>
                <option value="3">★★★☆☆ (3/5)</option>
                <option value="2">★★☆☆☆ (2/5)</option>
                <option value="1">★☆☆☆☆ (1/5)</option>
              </select>
              <textarea placeholder="What did you think?" value={comment} onChange={e => setComment(e.target.value)} className="input-field" rows={3} />
              <button type="submit" className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors">Submit</button>
            </form>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 px-1">Recent Reviews</h3>
            {reviews.length === 0 && <p className="text-sm text-slate-500 px-1">No reviews yet.</p>}
            {reviews.map(r => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-slate-900">{r.user.name}</span>
                  <span className="text-xs font-bold text-amber-500">★ {r.rating}</span>
                </div>
                <p className="text-sm text-slate-500">{r.comment}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
