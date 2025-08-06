 import { useEffect, useState } from 'react';

interface EngineStatus {
  engine: string;
  symbol: string;
  position: string;
  xp: number;
  override: boolean;
  pl: number;
  crates: number;
}

export default function OperatorConsole() {
  const [status, setStatus] = useState<EngineStatus | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulated pull — replace with Supabase fetch or local log stream
      fetch('/api/engine/status')
        .then(res => res.json())
        .then(data => setStatus(data))
        .catch(() => setStatus(null));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!status) {
    return (
      <div className="bg-black text-white p-4 text-center text-sm">
        <p className="text-gray-400">Waiting for engine signal...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border border-green-600 rounded-lg p-4 font-mono text-sm text-green-300 w-full max-w-xl mx-auto shadow-lg">
      <div className="mb-2 text-lg text-green-400 text-center">🧠 OPERATOR CONSOLE</div>

      <div className="grid grid-cols-2 gap-4">
        <div>🧪 Engine:</div>
        <div className="font-bold text-yellow-300">{status.engine.toUpperCase()}</div>

        <div>📈 Symbol:</div>
        <div className="text-white">{status.symbol}</div>

        <div>📊 Position:</div>
        <div className="text-blue-400">{status.position}</div>

        <div>💸 XP Earned:</div>
        <div className="text-green-400 font-bold">+{status.xp} XP</div>

        <div>🔥 Override:</div>
        <div className={status.override ? 'text-red-400 font-bold' : 'text-gray-400'}>
          {status.override ? 'ACTIVE' : 'OFF'}
        </div>

        <div>🎁 Crates:</div>
        <div className="text-pink-300">{status.crates}</div>

        <div>💰 Net P/L:</div>
        <div className={status.pl >= 0 ? 'text-green-300' : 'text-red-400'}>
          ${status.pl.toFixed(2)}
        </div>
      </div>
    </div>
  );
}