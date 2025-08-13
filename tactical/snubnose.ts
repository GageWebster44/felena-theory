 // snubnose.ts – High-Speed Spoof Snipe Bot with Cooldown
 
import { isOverrideEnabled } from '@/utils/overrideLogic';
import { executeTrade } from '@/utils/executeTrade';
import { updateXP } from '@/utils/updateXP';
import { isOnCooldown, triggerCooldown } from '@/utils/cooldownManager';

export const Snubnose = {
  engineMeta: {
    id: "Engine_001",
    codename: "Snubnose",
    class: "tactical",
    strategy: "reactive",
    description: "Scalp sniper for spoof wall reversals"
  },

  runEngine: async (
    data: any[],
    executeTrade: Function,
    updateXP: Function,
    userId: string
  ) => {
    const signals = data.filter((d: any) =>
      d.wallFlip === true &&
      d.volumeSurge &&
      d.bidDepth > d.askDepth &&
      d.confidence >= 0.9
    );

    for (const signal of signals) {
      if (isOnCooldown(signal.ticker)) {
        continue;
      }

      const size = Math.ceil(signal.confidence * 12);
      const xp = Math.floor(signal.confidence * 200);
      
      await executeTrade({
        symbol: signal.ticker,
        qty: size,
        side: "buy",
        type: "market",
        time_in_force: "gtc",
      });

      await updateXP(userId, xp, "Snubnose");
      triggerCooldown(signal.ticker);

    }

    return {
      signals: signals.map((d: any) => ({
        ticker: d.ticker,
        confidence: d.confidence,
        reason: "Scalp snipe trigger by Snubnose"
      }))
    };
  }
};