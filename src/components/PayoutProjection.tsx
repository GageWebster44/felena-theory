 // /components/PayoutProjection.tsx

import { useMemo } from 'react';

interface Props {
  xp: number;
}

export default function PayoutProjection({ xp }: Props) {
  const projections = useMemo(() => {
    const base = xp;

    return {
      low: base * 2,        // Low-tier engine (2x return estimate)
      medium: base * 5,     // Mid-tier engine (5x return estimate)
      high: base * 20,      // Override engine (20x projection)
    };
  }, [xp]);

  return (
    <div className="bg-zinc-900 border border-green-600 rounded-lg p-4 text-white space-y-2 mt-6">
      <h2 className="text-green-400 text-xl font-mono mb-2">📈 XP Deployment Projections</h2>

      <div className="text-sm text-gray-300">
        <p>🔹 Conservative: <span className="text-blue-300 font-bold">${projections.low.toLocaleString()}</span> potential</p>
        <p>🔸 Standard Engine: <span className="text-green-300 font-bold">${projections.medium.toLocaleString()}</span> potential</p>
        <p>🔥 Override Mode: <span className="text-yellow-300 font-bold">${projections.high.toLocaleString()}</span> potential</p>
      </div>

      <p className="text-xs text-gray-500 italic mt-2">
        These projections are based on hypothetical algorithmic returns. Actual performance depends on market conditions and user-linked capital.
      </p>
    </div>
  );
}