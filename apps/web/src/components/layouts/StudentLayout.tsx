import { LayoutWrapper } from './LayoutWrapper';
import { LayoutDashboard, Search, Library, FileText, Sparkles, Bookmark, Clock, Layers, Bell, User, Settings, PlayCircle } from 'lucide-react';

export function StudentLayout() {
  return <LayoutWrapper title="KnowVa Student" theme="purple" items={[
    { path: '/student/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/student/explore', label: 'Explore Library', icon: Search },
    { path: '/student/library', label: 'My Library', icon: Library },
    { path: '/student/notes', label: 'My Notes', icon: FileText },
    { path: '/student/ai', label: 'AI Study Assistant', icon: Sparkles },
    { path: '/student/quizzes', label: 'Practice Quizzes', icon: PlayCircle },
    { path: '/student/flashcards', label: 'Flashcards', icon: Layers },
    { path: '/student/planner', label: 'Study Planner', icon: Clock },
    { path: '/student/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { path: '/student/notifications', label: 'Notifications', icon: Bell },
    { path: '/student/profile', label: 'Academic Profile', icon: User },
    { path: '/student/settings', label: 'Settings', icon: Settings },
  ]} />;
}

export function LecturerLayout() {
  return <LayoutWrapper title="KnowVa Lecturer" theme="indigo" items={[
    { path: '/lecturer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/lecturer/courses', label: 'My Courses', icon: Library },
    { path: '/lecturer/uploads', label: 'Upload Resource', icon: FileText },
    { path: '/lecturer/resources', label: 'My Resources', icon: Search },
    { path: '/lecturer/drafts', label: 'Drafts', icon: Clock },
    { path: '/lecturer/analytics', label: 'Analytics', icon: Sparkles },
    { path: '/lecturer/notifications', label: 'Notifications', icon: Bell },
    { path: '/lecturer/profile', label: 'Lecturer Profile', icon: User },
    { path: '/lecturer/settings', label: 'Settings', icon: Settings },
  ]} />;
}

export function AdminLayout() {
  return <LayoutWrapper title="KnowVa Admin" theme="slate" items={[
    { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/users', label: 'User Management', icon: User },
    { path: '/admin/moderation', label: 'Moderation Queue', icon: FileText },
    { path: '/admin/academic', label: 'Academic Setup', icon: Library },
    { path: '/admin/audit', label: 'Audit Logs', icon: Search },
    { path: '/admin/notifications', label: 'Notifications', icon: Bell },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ]} />;
}
