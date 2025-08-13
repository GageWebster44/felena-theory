// src/utils/cooldownManager.ts
// Per-symbol cooldown tracker (timestamps in ms)

type CooldownMap = Record<string, number>;

const COOLDOWN_MS = 60_000; // 1 minute
const cooldowns: CooldownMap = {};


/**
 * Returns true if the symbol is currently in cooldown.
 */
export function isOnCooldown(symbol: string): boolean {
  const last = cooldowns[symbol];
  if (typeof last !== "number") return false;

  const now = Date.now();
  return now - last < COOLDOWN_MS;
}

/**
 * Starts/refreshes the cooldown for a symbol (sets "last action" to now).
 */
export function triggerCooldown(symbol: string): void {
  cooldowns[symbol] = Date.now();
}

/**
 * Milliseconds remaining until the cooldown ends for this symbol.
 * Returns 0 if not on cooldown.
 */
export function getCooldownRemaining(symbol: string): number {
  const last = cooldowns[symbol];
  if (typeof last !== "number") return 0;

  const now = Date.now();
  const remaining = COOLDOWN_MS - (now - last);
  return remaining > 0 ? remaining : 0;
}

/**
 * Optional: clear a cooldown manually.
 */
export function clearCooldown(symbol: string): void {
  delete cooldowns[symbol];
}

/**
 * Optional: expose the configured window (read-only).
 */
export function getCooldownWindowMs(): number {
  return COOLDOWN_MS;
}
