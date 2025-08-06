// loop.ts – Engine #43 (Loop)

export const Loop = {
  engineMeta: {
    id: "Engine_043",
    codename: "Loop",
    class: "behavioral",
    strategy: "scan",
    description: "Overtrading / loss spiral scanner"
  },
  runEngine: async (data: any) => {
    const matches = data.filter(d => d.signalWeight && d.signalWeight > 0.75);
    return {
      signals: matches.map(d => ({
        ticker: d.ticker,
        confidence: d.confidence || 0.85,
        reason: "Trigger Match for Loop"
      }))
    };
  }

};
