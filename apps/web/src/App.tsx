import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './components/PublicLayout';
import { DashboardLayout } from './components/DashboardLayout';
import { Home } from './routes/Home';
import { Login } from './routes/Login';
import { Register } from './routes/Register';
import { Notes } from './routes/Notes';
import { NoteDetail } from './routes/NoteDetail';
import { Profile } from './routes/Profile';
import { Upload } from './routes/Upload';
import { Library } from './routes/Library';
import { AdminDashboard } from './routes/AdminDashboard';
import { AdminModeration } from './routes/AdminModeration';
import { StudentDashboard } from './routes/StudentDashboard';
import { useAuth } from './lib/auth';

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-slate-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<Protected><DashboardLayout /></Protected>}>
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/notes/:id" element={<NoteDetail />} />
        <Route path="/library" element={<Library />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/moderation" element={<AdminModeration />} />
      </Route>
    </Routes>
  );
}
