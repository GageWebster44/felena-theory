// override.ts – Engine #97 (Override)

export const Override = {
  engineMeta: {
    id: "Engine_097",
    codename: "Override",
    class: "control",
    strategy: "adapt",
    description: "Manual control integration layer"
  },
  runEngine: async (data: any) => {
    const matches = data.filter(d => d.signalWeight && d.signalWeight > 0.75);
    return {
      signals: matches.map(d => ({
        ticker: d.ticker,
        confidence: d.confidence || 0.85,
        reason: "Trigger Match for Override"
      }))
    };
  }

};
