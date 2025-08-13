// capitula.ts – Engine #35 (Capitula)

export const Capitula = {
  engineMeta: {
    id: "Engine_035",
    codename: "Capitula",
    class: "behavioral",
    strategy: "scan",
    description: "Panic sell / capitulation monitor"
  },
  runEngine: async (data: any) => {
    const matches = data.filter(d => d.sentiment < -0.8 && d.redVolume > 2.5);
    return {
      signals: matches.map(d => ({
        ticker: d.ticker,
        confidence: d.confidence || 0.85,
        reason: "Capitulation Detected"
      }))
    };
  }

};
