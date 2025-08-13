
// synapse.ts – Behavioral Spoof Wall Engine with Cooldown

import { isOnCooldown, triggerCooldown } from '@/utils/cooldownManager';

export const Synapse = {
  engineMeta: {
    id: "Engine_032",
    codename: "Synapse",
    class: "behavioral",
    strategy: "scan",
    description: "Spoof wall and volume delta trigger"
  },

  runEngine: async (
    data: any[],
    executeTrade: Function,
    updateXP: Function,
    userId: string
  ) => {
    const matches = data.filter(
      (d: any) =>
        d.orderWall &&
        d.wallSize > 50000 &&
        d.confidence >= 0.85
    );

    for (const signal of matches) {
      if (isOnCooldown(signal.ticker)) {
        continue;
      }

      const qty = Math.ceil(signal.confidence * 10);
      const xp = Math.floor(signal.confidence * 150);

      await executeTrade({
        symbol: signal.ticker,
        qty,
        side: "buy",
        type: "market",
        time_in_force: "gtc",
      });

      await updateXP(userId, xp, "Synapse");
      triggerCooldown(signal.ticker);

    }

    return {
      signals: matches.map((d: any) => ({
        ticker: d.ticker,
        confidence: d.confidence,
        reason: "Spoof Wall Detected"
      }))
    };
  }
};