
// xpCashoutTrigger.ts – Determines when user hits payout thresholds

const CASHOUT_TIERS = [
  { tier: 'Mini', xp: 100 },
  { tier: 'Minor', xp: 250 },
  { tier: 'Major', xp: 500 },
  { tier: 'Max', xp: 1000 }
];

export function checkCashoutStatus(currentXP: number) {
  for (let i = CASHOUT_TIERS.length - 1; i >= 0; i--) {
    if (currentXP >= CASHOUT_TIERS[i].xp) {
      return {
        eligible: true,
        tier: CASHOUT_TIERS[i].tier,
        requiredXP: CASHOUT_TIERS[i].xp
      };
    }
  }
  return {
    eligible: false
  };
}
