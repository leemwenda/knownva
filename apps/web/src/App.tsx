import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './routes/Home';
import { Login } from './routes/Login';
import { Register } from './routes/Register';
import { Notes } from './routes/Notes';
import { NoteDetail } from './routes/NoteDetail';
import { Profile } from './routes/Profile';
import { Upload } from './routes/Upload';
import { AdminDashboard } from './routes/AdminDashboard';
import { AdminModeration } from './routes/AdminModeration';
import { useAuth } from './lib/auth';

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="notes" element={<Notes />} />
        <Route path="notes/:id" element={<NoteDetail />} />
        <Route path="profile" element={<Protected><Profile /></Protected>} />
        <Route path="upload" element={<Protected><Upload /></Protected>} />
        <Route path="admin" element={<Protected><AdminDashboard /></Protected>} />
        <Route path="admin/moderation" element={<Protected><AdminModeration /></Protected>} />
      </Route>
    </Routes>
  );
}
