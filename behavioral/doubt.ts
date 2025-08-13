// doubt.ts – Engine #36 (Doubt)

export const Doubt = {
  engineMeta: {
    id: "Engine_036",
    codename: "Doubt",
    class: "behavioral",
    strategy: "scan",
    description: "No-trade indecision zone logic"
  },
  runEngine: async (data: any) => {
    const matches = data.filter(d => d.signalWeight && d.signalWeight > 0.75);
    return {
      signals: matches.map(d => ({
        ticker: d.ticker,
        confidence: d.confidence || 0.85,
        reason: "Trigger Match for Doubt"
      }))
    };
  }

};
