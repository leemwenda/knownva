import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';

interface Detail {
  id: number;
  title: string;
  description: string;
  resourceType: string;
  isPremium: boolean;
  averageRating: number;
  ratingCount: number;
  downloadsCount: number;
  uploader: { id: number; name: string } | null;
}

export function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api<{ ok: true; note: Detail }>(`/notes/${id}`)
      .then((res) => setNote(res.note))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, [id]);

  const download = () => {
    window.open(`/api/v1/notes/${id}/download`, '_blank');
  };

  if (error) return <p className="text-red-600">{error}</p>;
  if (!note) return <p>Loading…</p>;

  return (
    <article className="space-y-4 rounded bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">{note.title}</h1>
      <p className="text-slate-700">{note.description}</p>
      <dl className="grid grid-cols-2 gap-2 text-sm text-slate-600">
        <div><dt className="font-medium">Type</dt><dd>{note.resourceType}</dd></div>
        <div><dt className="font-medium">Uploader</dt><dd>{note.uploader?.name ?? '—'}</dd></div>
        <div><dt className="font-medium">Rating</dt><dd>★ {note.averageRating} ({note.ratingCount})</dd></div>
        <div><dt className="font-medium">Downloads</dt><dd>{note.downloadsCount}</dd></div>
      </dl>
      <button onClick={download}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        Download
      </button>
    </article>
  );
}
