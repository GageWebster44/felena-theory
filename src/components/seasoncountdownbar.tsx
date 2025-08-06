 import { useEffect, useState } from 'react';

export default function SeasonCountdownBar() {
  const [timeLeft, setTimeLeft] = useState('');

  // Set this to your actual season end time (UTC recommended)
  const SEASON_END = new Date('2025-10-01T00:00:00Z');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = SEASON_END.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('⏳ Season has ended.');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      setTimeLeft(`🌍 Season resets in ${days}d ${hrs}h ${mins}m ${secs}s`);
    };

    tick(); // initial run
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-green-400 text-center text-sm p-2 border-b border-green-700 font-mono tracking-wider">
      {timeLeft}
    </div>
  );
}