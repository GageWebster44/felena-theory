
export type Role = 'public' | 'guardian' | 'developer' | 'admin';

export const XP_TIERS = [
  { name: 'Recruit', minXP: 0 },
  { name: 'Operator I', minXP: 100 },
  { name: 'Operator II', minXP: 500 },
  { name: 'Agent', minXP: 1000 },
  { name: 'Controller', minXP: 2500 },
  { name: 'Architect', minXP: 10000 },
];

export function getTierName(xp: number): string {
  const tier = XP_TIERS.slice().reverse().find(t => xp >= t.minXP);
  return tier ? tier.name : 'Recruit';
}

export function hasAdminAccess(role: string): boolean {
  return role === 'admin' || role === 'developer';
}

export function promoteRoleByXP(xp: number): Role {
  if (xp >= 10000) return 'admin';
  if (xp >= 2500) return 'developer';
  if (xp >= 500) return 'guardian';
  return 'public';
}

// Optional hook-like utility (for client components)
export async function useOperator() {
  const { data: { user } } = await import('@/utils/supabaseClient').then(m => m.supabase.auth.getUser());
  if (!user) return { role: 'public', id: '', xp: 0 };
  const { data: profile } = await import('@/utils/supabaseClient')
    .then(m => m.supabase)
    .then(sb => sb.from('user_profiles').select('id, role, xp').eq('id', user.id).single());
  if (!profile) return { role: 'public', id: user.id, xp: 0 };
  return { role: profile.role, id: user.id, xp: profile.xp || 0 };
}