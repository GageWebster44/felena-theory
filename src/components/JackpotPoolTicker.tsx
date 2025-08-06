 import { useEffect, useState } from 'react';
import supabase from '@/utils/supabaseClient';

export default function JackpotPoolTicker() {
  const [jackpotXP, setJackpotXP] = useState<number | null>(null);
  const [seasonNumber, setSeasonNumber] = useState<number>(0);

  useEffect(() => {
    const fetchJackpot = async () => {
      // Replace with actual dynamic season logic if needed
      const currentSeason = 0;
      setSeasonNumber(currentSeason);

      const { data, error } = await supabase
        .from('jackpot_pool')
        .select('xp_value')
        .eq('season', currentSeason)
        .single();

      if (error) {
        console.error('Jackpot fetch error:', error.message);
      } else {
        setJackpotXP(data?.xp_value || 0);
      }
    };

    fetchJackpot();

    const interval = setInterval(fetchJackpot, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center py-2 bg-green-900 text-green-300 text-sm font-mono shadow-md">
      🎯 Jackpot Pool (Season {seasonNumber}):{' '}
      {jackpotXP !== null ? (
        <span className="text-green-400 font-bold">
          {jackpotXP.toLocaleString()} XP
        </span>
      ) : (
        <span className="italic text-gray-400">Loading jackpot...</span>
      )}
    </div>
  );
}