export type Role = 'student' | 'lecturer' | 'superadmin';

export const PERMISSIONS = {
  'student.library.manage': ['student', 'lecturer', 'superadmin'],
  'student.notes.manage': ['student', 'lecturer', 'superadmin'],
  'student.ai.use': ['student', 'lecturer', 'superadmin'],
  'student.flashcards.manage': ['student', 'lecturer', 'superadmin'],
  'student.planner.manage': ['student', 'lecturer', 'superadmin'],
  'lecturer.resources.create': ['lecturer', 'superadmin'],
  'lecturer.analytics.view_own': ['lecturer', 'superadmin'],
  'admin.users.manage': ['superadmin'],
  'admin.academic.manage': ['superadmin'],
  'admin.moderation.manage': ['superadmin'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, permission: string): boolean {
  const allowed = (PERMISSIONS as Record<string, readonly Role[]>)[permission];
  if (!allowed) {
    console.warn(`[permissions] Unknown permission: ${permission} (denied)`);
    return false;
  }
  return allowed.includes(role);
}
