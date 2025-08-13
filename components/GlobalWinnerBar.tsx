// src/components/GlobalWinnerBar.tsx
import { useEffect, useState } from 'react';

import supabase from '@/utils/supabaseClient';

type WinnerRow = {
  id: string;
  user_id: string;
  xp_awarded: number;
  alias?: string | null;
  created_at: string;
};

export default function GlobalWinnerBar() {
  const [latest, setLatest] = useState<WinnerRow | null>(null);

  async function fetchLatestWinner() {
    try {
      const { data, error } = await supabase
        .from<WinnerRow>('lottery_winners')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        // Quietly bail in prod; keep console for dev visibility
        // eslint-disable-next-line no-console
        console.error('Supabase error in GlobalWinnerBar:', error);
        return;
      }
      setLatest(data && data.length > 0 ? data[0] : null);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('GlobalWinnerBar fetchLatestWinner exception:', e);
    }
  }

  useEffect(() => {
    fetchLatestWinner();
    const interval = setInterval(fetchLatestWinner, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!latest) return null;

  const shortId = latest.user_id ? `${latest.user_id.slice(0, 6)}…` : 'Unknown';
  const who = latest.alias?.trim() ? latest.alias : shortId;
  const amount = Number.isFinite(latest.xp_awarded) ? latest.xp_awarded.toLocaleString() : '0';

  return (
    <div className="w-full bg-black border-t border-b border-green-600 py-1 px-4 text-center text-sm font-mono text-green-300">
      <span className="animate-pulse">
        {who} just won {amount} XP in the Weekly Lottery
      </span>
    </div>
  );
}
