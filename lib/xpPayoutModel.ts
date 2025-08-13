// Single place to define crate → payout math.
// Client can import for display, API uses it to PAY.
export const CRATE_PAYOUTS_USD: Record<string, number> = {
  // example tiers — rename to your actual tier keys
  bronze: 5,
  silver: 20,
  gold: 50,
  platinum: 100,
};

export function getPayoutForTier(tier: string): number {
  return CRATE_PAYOUTS_USD[tier] ?? 0;
}
