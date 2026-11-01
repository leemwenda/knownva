import { LayoutWrapper } from './LayoutWrapper';
import { LayoutDashboard, Search, Library, FileText, Sparkles, Bookmark, Clock, Bell, User, Settings, PlayCircle, Layers } from 'lucide-react';

export function StudentLayout() {
  return <LayoutWrapper title="KnowVa Student" items={[
    { path: '/student/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/student/explore', label: 'Resources', icon: Search },
    { path: '/student/notes', label: 'My Notes', icon: FileText },
    { path: '/student/ai', label: 'AI Study Assistant', icon: Sparkles },
    { path: '/student/flashcards', label: 'Flashcards', icon: Layers },
    { path: '/student/quizzes', label: 'Quizzes', icon: PlayCircle },
    { path: '/student/planner', label: 'Study Planner', icon: Clock },
    { path: '/student/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { path: '/student/notifications', label: 'Notifications', icon: Bell },
    { path: '/student/profile', label: 'Profile', icon: User },
    { path: '/student/settings', label: 'Settings', icon: Settings },
  ]} />;
}

export function LecturerLayout() {
  return <LayoutWrapper title="KnowVa Lecturer" items={[
    { path: '/lecturer/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/lecturer/courses', label: 'My Courses', icon: Library },
    { path: '/lecturer/uploads', label: 'Uploads', icon: FileText },
    { path: '/lecturer/resources', label: 'My Resources', icon: Search },
    { path: '/lecturer/drafts', label: 'Drafts', icon: Clock },
    { path: '/lecturer/analytics', label: 'Analytics', icon: Sparkles },
    { path: '/lecturer/profile', label: 'Profile', icon: User },
    { path: '/lecturer/settings', label: 'Settings', icon: Settings },
  ]} />;
}

export function AdminLayout() {
  return <LayoutWrapper title="KnowVa Admin" items={[
    { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: User },
    { path: '/admin/moderation', label: 'Moderation', icon: FileText },
    { path: '/admin/academic', label: 'Academic Setup', icon: Library },
    { path: '/admin/audit', label: 'Audit Logs', icon: Search },
    { path: '/admin/reports', label: 'Reports', icon: Sparkles },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ]} />;
}
