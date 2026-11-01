export type Role = 'student' | 'lecturer' | 'superadmin';

export const PERMISSIONS = {
  'student.library.manage': ['student', 'lecturer', 'superadmin'],
  'student.notes.manage': ['student', 'lecturer', 'superadmin'],
  'lecturer.resources.create': ['lecturer', 'superadmin'],
  'lecturer.analytics.view_own': ['lecturer', 'superadmin'],
  'admin.users.manage': ['superadmin'],
  'admin.academic.manage': ['superadmin'],
  'admin.moderation.manage': ['superadmin'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission] as readonly Role[];
  return allowedRoles.includes(role);
}
