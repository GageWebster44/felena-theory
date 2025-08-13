// src/utils/authUtils.ts

// Roles your app recognizes. Add more here if you introduce new ones.
export type Role = 'admin' | 'developer' | 'moderator' | 'operator' | 'user';

export interface UserLike {
  role?: Role | null;
  // Feel free to extend with other flags or metadata (kept open for flexibility)
  // e.g. guardian_verified?: boolean;
  [key: string]: unknown;
}

const ADMIN_ROLES: ReadonlyArray<Role> = ['admin', 'developer'];

/**
 * Default helper used across the app to check admin-level access.
 * Kept as a default export to match existing imports in your codebase.
 */
export default function hasAdminAccess(user?: UserLike | null): boolean {
  const role = (user?.role ?? 'user') as Role;
  return ADMIN_ROLES.includes(role);
}

/** Generic role checker */
export function hasRole(user: UserLike | null | undefined, roles: ReadonlyArray<Role>): boolean {
  const role = (user?.role ?? 'user') as Role;
  return roles.includes(role);
}

/** Convenience helpers (optional) */
export function isAdmin(user?: UserLike | null): boolean {
  return (user?.role as Role) === 'admin';
}

export function isDeveloper(user?: UserLike | null): boolean {
  return (user?.role as Role) === 'developer';
}

/**
 * Throws if the user does not have an allowed role.
 * Useful on server routes or gated actions.
 */
export function assertRole(user: UserLike | null | undefined, roles: ReadonlyArray<Role>): void {
  if (!hasRole(user, roles)) {
    throw new Error('Forbidden: insufficient role');
  }
}
