// src/utils/roles.ts

// ---- Roles (app permissions) -----------------------------------------------
// NOTE: Only 'public' is ever returned by XP-based promotion.
// 'developer' and 'admin' must be assigned manually (never via XP).
export type Role = 'public' | 'guardian' | 'developer' | 'admin';

// Quick guard used across the app to keep dev/admin features locked down.
export function hasAdminAccess(role: string): boolean {
  return role === 'developer' || role === 'admin';
}

// ---- Dynamic XP tiers (progression only, not permissions) ------------------

export type Tier = { name: string; minXP: number };

/**
 * Build widening XP thresholds based on:
 *   base   - first jump after 0 XP
 *   growth - how much each step grows vs the previous (exponential)
 *   roundStep - round thresholds to clean numbers (e.g., 100)
 *
 * Example with base=1_000, growth=3, roundStep=100 produces:
 *   0, 1_000, 4_000, 13_000, 40_000, 121_000, ...
 */
export function makeDynamicTiers(
  names: string[],
  opts?: { base?: number; growth?: number; roundStep?: number },
): Tier[] {
  const base = Math.max(1, opts?.base ?? 1_000);
  const growth = Math.max(1.01, opts?.growth ?? 3.0);
  const roundStep = Math.max(1, opts?.roundStep ?? 100);

  const roundTo = (n: number) => Math.round(n / roundStep) * roundStep;

  const tiers: Tier[] = [];
  let threshold = 0;

  names.forEach((name, idx) => {
    if (idx === 0) {
      threshold = 0; // first tier always starts at 0
    } else {
      const step = base * Math.pow(growth, idx - 1);
      threshold += step;
    }
    tiers.push({ name, minXP: idx === 0 ? 0 : roundTo(threshold) });
  });

  return tiers;
}

// Name list (feel free to tweak labels without touching the math)
export const XP_TIER_NAMES = [
  'Recruit',
  'Runner',
  'Operator',
  'Agent',
  'Controller',
  'Architect',
  'Legend',
];

// Huge, widening jumps (endless loop feel).
// You can tune these three numbers to make the climb easier/harder.
export const XP_TIERS: Tier[] = makeDynamicTiers(XP_TIER_NAMES, {
  base: 1_000, // first jump after 0 XP
  growth: 3.0, // aggressive widening every tier
  roundStep: 100, // keep thresholds tidy
});

// Utility: resolve the tier name for a given XP total.
export function getTierName(xp: number): string {
  if (!Number.isFinite(xp) || xp < 0) return XP_TIER_NAMES[0]; // Find the highest tier whose minXP <= xp
  let current = XP_TIER_NAMES[0];
  for (const t of XP_TIERS) {
    if (xp >= t.minXP) current = t.name;
    else break;
  }
  return current;
}

// ---- Role decisions from XP (permission wall stays) ------------------------

// Public users never auto-upgrade to privileged roles. All elevation to
// 'developer' / 'admin' must be done manually by staff.
export function promoteRoleByXP(_xp: number): Role {
  return 'public';
}

// ---- Optional helper: fetch user's role and xp (client-safe) ---------------

// Returns the user's current role & xp using the shared supabase client.
// Uses dynamic imports so this module works in SSR and client contexts.
export async function useOperator(): Promise<{
  role: Role;
  profile: { id: string; role: Role; xp: number } | null;
}> {
  // Lazy import to avoid bundling in SSR contexts where window is undefined
  const { default: sbModule } = await import('@/utils/supabaseClient');
  const supabase = sbModule;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return { role: 'public', profile: null };
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select<'id, role, xp'>('id, role, xp')
    .eq('id', auth.user.id)
    .single();

  const role: Role = (profile?.role as Role | undefined) ?? 'public';

  return {
    role,
    profile: profile ? { id: profile.id, role, xp: Number(profile.xp) || 0 } : null,
  };
}
