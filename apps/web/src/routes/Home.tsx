import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Study smarter with KnowVa</h1>
      <p className="max-w-2xl text-slate-600">
        Find lecture notes, past papers and study guides from students and lecturers.
      </p>
      <Link to="/notes"
        className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        Browse resources
      </Link>
    </div>
  );
}
