// src/components/JackpotPoolTicker.tsx
// Small status bar that shows the current XP jackpot for the active season.

import React, { useEffect, useState } from 'react';

import supabase from '../utils/supabaseClient'; // <- if you use path aliases, switch to '@/utils/supabaseClient'

type JackpotRow = {
  xp_value: number | null;
  season: number | null;
  updated_at?: string | null;
};

const REFRESH_MS = 60_000;
const CURRENT_SEASON =
  Number(process.env.NEXT_PUBLIC_SEASON) > 0 ? Number(process.env.NEXT_PUBLIC_SEASON) : 1;

export default function JackpotPoolTicker() {
  const [xp, setXp] = useState<number | null>(null);
  const [season, setSeason] = useState<number>(CURRENT_SEASON);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchJackpot(activeSeason = season) {
    setLoading(true);
    // Read most-recent jackpot row for the season
    const { data, error } = await supabase
      .from<JackpotRow>('jackpot_pool')
      .select('xp_value, season, updated_at')
      .eq('season', activeSeason)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      // keep UI up but don't crash
      console.error('jackpot_pool fetch error:', error.message);
      setLoading(false);
      return;
    }

    setXp(data?.xp_value ?? 0);
    setSeason(data?.season ?? activeSeason);
    setLoading(false);
  }

  useEffect(() => {
    fetchJackpot();
    const t = setInterval(fetchJackpot, REFRESH_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only; fetchJackpot handles season internally

  return (
    <div className="w-full bg-black border-t border-b border-green-600 py-2 px-4 text-center text-sm font-mono text-green-300 shadow-md">
      <span className="font-bold">Jackpot Pool</span>{' '}
      <span className="text-gray-400">(Season {season})</span>{' '}
      {loading ? (
        <span className="italic text-gray-400">Loading jackpot…</span>
      ) : (
        <span className="text-green-400 font-bold">{Number(xp ?? 0).toLocaleString()} XP</span>
      )}
    </div>
  );
}
