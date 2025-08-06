// GridOrchestrator.ts – Finalized version for Felena Theory Engine Grid

import { GridMeta } from './GridMeta';
import * as Engines from './AllEngines_Final';

export const GridOrchestrator = {
  async runGrid(data: any) {
    const results = [];

    for (const meta of GridMeta) {
      const engine = Engines[meta.codename];
      if (!engine?.runEngine) continue;

      try {
        const output = await engine.runEngine(data);

        results.push({
          id: meta.id,
          codename: meta.codename,
          class: meta.class,
          strategy: meta.strategy,
          description: meta.description,
          signals: output.signals || [],
        });
      } catch (err) {
        console.warn(`⚠️ Engine ${meta.codename} failed to execute.`, err);
      }
    }

    // Sort by average confidence descending
    const sorted = results.sort((a, b) => {
      const avgA =
        a.signals.reduce((sum, s) => sum + (s.confidence || 0), 0) /
        (a.signals.length || 1);
      const avgB =
        b.signals.reduce((sum, s) => sum + (s.confidence || 0), 0) /
        (b.signals.length || 1);
      return avgB - avgA;
    });

    // Output summary structure
    return {
      summary: sorted.map((r) => ({
        engine: r.codename,
        count: r.signals.length,
        avgConfidence:
          (
            r.signals.reduce((sum, s) => sum + (s.confidence || 0), 0) /
            (r.signals.length || 1)
          ).toFixed(2),
        topSignal: r.signals[0]?.ticker || null,
        class: r.class,
        strategy: r.strategy,
        description: r.description,
      })),
      allSignals: sorted,
    };
  },
};