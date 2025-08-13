// src/hooks/useUserXP.ts
import { useEffect, useState } from 'react';

import supabase from '@/utils/supabaseClient';

export type UseUserXPResult = {
  xpTotal: number;
  loading: boolean;
  error?: string;
};

/**
 * Reads the signed-in user's XP from Supabase.
 * Adjust table/column names if your schema differs.
 */
export function useUserXP(): UseUserXPResult {
  const [xpTotal, setXpTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        // get current user
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();

        if (userErr) throw userErr; // no session -> treat as 0 XP

        if (!user) {
          if (!cancelled) setLoading(false);
          return;
        } // fetch XP row (adjust table/column if needed)

        const { data, error } = await supabase
          .from('xp_wallet')
          .select('xp')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (!cancelled) {
          setXpTotal((data?.xp as number) ?? 0);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load XP');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { xpTotal, loading, error };
}

export default useUserXP;
