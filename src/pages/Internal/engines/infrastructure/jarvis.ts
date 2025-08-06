 // jarvis.ts – Fallback Engine Logic with Cooldown

import { isOnCooldown, triggerCooldown } from '@/utils/cooldownManager';

export const Jarvis = {
  engineMeta: {
    id: "Engine_046",
    codename: "Jarvis",
    class: "infrastructure",
    strategy: "adapt",
    description: "Master AI coordinator"
  },

  runEngine: async (
    data: any[],
    executeTrade: Function,
    updateXP: Function,
    userId: string
  ) => {
    const signals = data.filter((d: any) => d.signalWeight >= 0.75);

    for (const signal of signals) {
      if (isOnCooldown(signal.ticker)) {
        continue;
      }

      const xp = Math.floor(signal.signalWeight * 100);
      const qty = Math.ceil(signal.signalWeight * 10);

      await executeTrade({
        symbol: signal.ticker,
        qty,
        side: "buy",
        type: "market",
        time_in_force: "gtc",
      });

      await updateXP(userId, xp, "Jarvis");
      triggerCooldown(signal.ticker);

    }

    return {
      signals: signals.map((d: any) => ({
        ticker: d.ticker,
        confidence: d.signalWeight,
        reason: "Fallback execution via Jarvis"
      }))
    };
  }
};