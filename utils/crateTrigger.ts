// crateTrigger.ts – Detects XP crate tier milestones + utilities

let lastTier: string | null = null;

export const CRATE_TIERS = [
  { name: 'Mini', xp: 100 },
  { name: 'Minor', xp: 250 },
  { name: 'Major', xp: 500 },
  { name: 'Max', xp: 1000 },
];

// Detect if a milestone has been newly reached
export function checkCrateMilestone(currentXP: number): {
  triggered: boolean;
  tier?: string;
} {
  let current: string | null = null;

  for (let i = CRATE_TIERS.length - 1; i >= 0; i--) {
    if (currentXP >= CRATE_TIERS[i].xp) {
      current = CRATE_TIERS[i].name;
      break;
    }
  }

  if (current && current !== lastTier) {
    lastTier = current;
    return { triggered: true, tier: current };
  }

  return { triggered: false };
}

// Manually reset crate trigger state (used for testing or logout)
export function resetCrateMilestoneState() {
  lastTier = null;
}

// Get next tier info given current XP
export function getNextCrateTier(currentXP: number): { name: string; xp: number } | null {
  for (const tier of CRATE_TIERS) {
    if (currentXP < tier.xp) {
      return tier;
    }
  }
  return null;
}

// Get tier info based on any XP value
export function getCrateTierForXP(xp: number): { name: string; xp: number } {
  for (let i = CRATE_TIERS.length - 1; i >= 0; i--) {
    if (xp >= CRATE_TIERS[i].xp) {
      return CRATE_TIERS[i];
    }
  }
  return CRATE_TIERS[0];
}

// Return full tier list for UI/reference
export function getAllCrateTiers(): { name: string; xp: number }[] {
  return CRATE_TIERS;
}
