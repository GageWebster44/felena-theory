 import { useEffect, useState } from 'react';
import supabase from '@/utils/supabaseClient';

export default function GlobalWinnerBar() {
  const [latest, setLatest] = useState<any>(null);

  useEffect(() => {
    const fetchLatestWinner = async () => {
      const { data } = await supabase
        .from('lottery_winners')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setLatest(data[0]);
      }
    };

    fetchLatestWinner();
    const interval = setInterval(fetchLatestWinner, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!latest) return null;

  return (
    <div className="w-full bg-black border-t border-b border-green-600 py-1 px-4 text-center text-sm font-mono text-green-300 animate-pulse">
      🎉 {latest.user_id.slice(0, 6)} just won {latest.xp_awarded} XP in the Weekly Lottery!
    </div>
  );
}