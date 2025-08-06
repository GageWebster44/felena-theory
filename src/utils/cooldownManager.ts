
// cooldownManager.ts – Per-symbol trade cooldown tracker

type CooldownMap = {
  [symbol: string]: number;
};

const cooldowns: CooldownMap = {};
const COOLDOWN_MS = 60000; // 1 minute cooldown per symbol

export function isOnCooldown(symbol: string): boolean {
  const now = Date.now();
  return cooldowns[symbol] && now - cooldowns[symbol] < COOLDOWN_MS;
}

export function triggerCooldown(symbol: string): void {
  cooldowns[symbol] = Date.now();
}

export function getCooldownRemaining(symbol: string): number {
  const now = Date.now();
  return cooldowns[symbol] ? Math.max(0, COOLDOWN_MS - (now - cooldowns[symbol])) : 0;
}
