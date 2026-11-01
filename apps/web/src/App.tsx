import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './components/PublicLayout';
import { StudentLayout, LecturerLayout, AdminLayout } from './components/layouts/StudentLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './lib/auth';

import { Home } from './routes/Home';
import { Login } from './routes/Login';
import { Register } from './routes/Register';
import { Profile, Settings, Notifications } from './routes/SharedPages';

// Student Pages
import { StudentDashboard } from './routes/student/StudentDashboard';
import { Notes } from './routes/student/Notes';
import { NoteDetail } from './routes/student/NoteDetail';
import { Library } from './routes/student/Library';
import { AIStudy } from './routes/student/AIStudy';
import { StudyPlanner } from './routes/student/StudyPlanner';
import { Flashcards } from './routes/student/Flashcards';
import { Quizzes } from './routes/student/Quizzes';

// Lecturer Pages
import { LecturerDashboard } from './routes/lecturer/LecturerDashboard';
import { Upload } from './routes/lecturer/Upload';
import { LecturerResources } from './routes/lecturer/LecturerResources';
import { LecturerAnalytics } from './routes/lecturer/LecturerAnalytics';
import { Drafts } from './routes/lecturer/Drafts';
import { Courses } from './routes/lecturer/Courses';

// Admin Pages
import { AdminDashboard } from './routes/admin/AdminDashboard';
import { AdminModeration } from './routes/admin/AdminModeration';
import { AdminUsers } from './routes/admin/AdminUsers';
import { AdminAcademic } from './routes/admin/AdminAcademic';
import { AuditLogs } from './routes/admin/AuditLogs';

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'superadmin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'lecturer') return <Navigate to="/lecturer/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="/dashboard" element={<RoleRedirect />} />
      <Route path="/access-denied" element={<div className="p-20 text-center"><h1 className="text-4xl font-bold text-red-500">403 Forbidden</h1><p className="mt-4 text-slate-500">You do not have permission to view this page.</p></div>} />

      {/* ── STUDENT ROUTES ── */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<StudentLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/explore" element={<Notes />} />
          <Route path="/student/explore/:id" element={<NoteDetail />} />
          <Route path="/student/library" element={<Library />} />
          <Route path="/student/notes" element={<Library />} /> {/* Pointing to Library for now */}
          <Route path="/student/bookmarks" element={<Library />} /> {/* Pointing to Library for now */}
          <Route path="/student/ai" element={<AIStudy />} />
          <Route path="/student/planner" element={<StudyPlanner />} />
          <Route path="/student/flashcards" element={<Flashcards />} />
          <Route path="/student/quizzes" element={<Quizzes />} />
          <Route path="/student/notifications" element={<Notifications />} />
          <Route path="/student/profile" element={<Profile />} />
          <Route path="/student/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* ── LECTURER ROUTES ── */}
      <Route element={<ProtectedRoute allowedRoles={['lecturer', 'superadmin']} />}>
        <Route element={<LecturerLayout />}>
          <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
          <Route path="/lecturer/courses" element={<Courses />} />
          <Route path="/lecturer/uploads" element={<Upload />} />
          <Route path="/lecturer/resources" element={<LecturerResources />} />
          <Route path="/lecturer/drafts" element={<Drafts />} />
          <Route path="/lecturer/analytics" element={<LecturerAnalytics />} />
          <Route path="/lecturer/notifications" element={<Notifications />} />
          <Route path="/lecturer/profile" element={<Profile />} />
          <Route path="/lecturer/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* ── ADMIN ROUTES ── */}
      <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/moderation" element={<AdminModeration />} />
          <Route path="/admin/academic" element={<AdminAcademic />} />
          <Route path="/admin/audit" element={<AuditLogs />} />
          <Route path="/admin/notifications" element={<Notifications />} />
          <Route path="/admin/profile" element={<Profile />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}
