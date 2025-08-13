// loopResetHandler.ts – Resets flash + crate tier trigger memory between sessions

let lastXP = 0;
let lastTier: string | null = null;

export function shouldResetLoop(currentXP: number): boolean {
  // If XP dropped or loop restarted
  if (currentXP < lastXP) {
    lastTier = null;
    lastXP = currentXP;
    return true;
  }

  lastXP = currentXP;
  return false;
}

export function resetCrateMemory() {
  lastTier = null;
}

export function getLastTier() {
  return lastTier;
}

export function setLastTier(tier: string) {
  lastTier = tier;
}
