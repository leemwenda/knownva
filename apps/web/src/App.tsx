import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './components/PublicLayout';
import { StudentLayout, LecturerLayout, AdminLayout } from './components/layouts/StudentLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './lib/auth';

// Public Pages
import { Home } from './routes/Home';
import { Login } from './routes/Login';
import { Register } from './routes/Register';

// Shared Pages
import { Profile, Settings, Notifications } from './routes/SharedPages';
import { Placeholder } from './routes/Placeholder';

// Student Pages
import { StudentDashboard } from './routes/student/StudentDashboard';
import { Notes } from './routes/student/Notes';
import { NoteDetail } from './routes/student/NoteDetail';
import { Library } from './routes/student/Library';
import { MyNotes } from './routes/student/MyNotes';
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
  if (loading) return <div className="p-20 text-center text-slate-500 dark:text-slate-400">Loading...</div>;
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
      {/* Redirect old/legacy links to the new places */}
      <Route path="/notes" element={<Navigate to="/student/explore" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="/access-denied" element={<div className="p-20 text-center"><h1 className="text-4xl font-bold text-red-500">403 Forbidden</h1><p className="mt-4 text-slate-500 dark:text-slate-400">You do not have permission to view this page.</p></div>} />

      {/* ── STUDENT PORTAL ── */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<StudentLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/explore" element={<Notes />} />
          <Route path="/student/explore/:id" element={<NoteDetail />} />
          <Route path="/student/notes" element={<MyNotes />} />
          <Route path="/student/bookmarks" element={<Library />} />
          <Route path="/student/ai" element={<AIStudy />} />
          <Route path="/student/planner" element={<StudyPlanner />} />
          <Route path="/student/flashcards" element={<Flashcards />} />
          <Route path="/student/quizzes" element={<Quizzes />} />
          <Route path="/student/notifications" element={<Notifications />} />
          <Route path="/student/profile" element={<Profile />} />
          <Route path="/student/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* ── LECTURER PORTAL ── */}
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

      {/* ── ADMIN PORTAL ── */}
      <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/moderation" element={<AdminModeration />} />
          <Route path="/admin/academic" element={<AdminAcademic />} />
          <Route path="/admin/audit" element={<AuditLogs />} />
          <Route path="/admin/reports" element={<Placeholder title="Platform Reports" />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
          <h1 className="text-6xl font-extrabold text-slate-900 mb-2 dark:text-white">404</h1>
          <p className="text-slate-500 mb-6 dark:text-slate-400">This page does not exist.</p>
          <a href="/dashboard" className="btn-primary">Go to Dashboard</a>
        </div>
      } />
    </Routes>
  );
}
