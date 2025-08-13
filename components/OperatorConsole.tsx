// src/components/OperatorConsole.tsx
import React, { useEffect, useState } from 'react';

type EngineStatus = {
  engine: string;
  symbol: string;
  position: number;
  xp: number;
  override: boolean;
  pl: number;
  crates: number;
} | null;

export default function OperatorConsole() {
  const [status, setStatus] = useState<EngineStatus>(null);

  useEffect(() => {
    let alive = true;

    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/engine/status');
        if (!res.ok) return;
        const data = (await res.json()) as EngineStatus;
        if (alive) setStatus(data);
      } catch {
        if (alive) setStatus(null);
      }
    };

    // initial + poll
    fetchStatus();
    const id = setInterval(fetchStatus, 5000);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!status) {
    return (
      <div className="bg-zinc-950 border border-green-600 rounded-lg p-4 font-mono text-sm text-green-300 w-full max-w-xl mx-auto shadow-lg text-center">
        <p className="text-gray-400">Waiting for engine signal…</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border border-green-600 rounded-lg p-4 font-mono text-sm text-green-300 w-full max-w-xl mx-auto shadow-lg">
      <div className="mb-2 text-lg text-green-400 text-center">Operator Console</div>

      <div className="grid grid-cols-2 gap-4">
        <div>Engine</div>
        <div className="font-bold text-yellow-300">{status.engine?.toUpperCase() ?? 'N/A'}</div>

        <div>Symbol</div>
        <div className="text-white">{status.symbol ?? 'N/A'}</div>

        <div>Position</div>
        <div className="text-blue-400">
          {Number.isFinite(status.position) ? status.position : 0}
        </div>

        <div>XP Earned</div>
        <div className="text-green-400 font-bold">{(status.xp ?? 0).toLocaleString()} XP</div>

        <div>Override</div>
        <div className={status.override ? 'text-red-400 font-bold' : 'text-gray-400'}>
          {status.override ? 'ACTIVE' : 'OFF'}
        </div>

        <div>Crates</div>
        <div className="text-pink-300">{status.crates ?? 0}</div>

        <div>Net P/L</div>
        <div className={(status.pl ?? 0) >= 0 ? 'text-green-300' : 'text-red-400'}>
          {(status.pl ?? 0).toFixed(2)}
        </div>
      </div>
    </div>
  );
}
