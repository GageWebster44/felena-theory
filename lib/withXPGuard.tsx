// src/lib/withXPGuard.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

type GuardedProps = Record<string, unknown>;

/**
 * HOC that requires a user to have at least `requiredXP` total XP.
 * If they don't, it redirects to /locked.
 */
export default function withXPGuard<P extends GuardedProps>(
  Wrapped: React.ComponentType<P>,
  requiredXP: number
) {
  function Guarded(props: P) {
    const router = useRouter();
    const user = useUser();
    const supabase = useSupabaseClient();
    const [loading, setLoading] = useState(true);
    const [xp, setXp] = useState(0);

    useEffect(() => {
      let cancelled = false;

      const run = async () => {
        try {
          // Wait for auth
          if (!user) {
            if (!cancelled) setLoading(false);
            return;
          }

          // NOTE: drop the generic on `.from(...)` to avoid TS2558.
          // Cast the result rows to the shape we need.
          const { data, error } = await supabase
            .from('xp_log')
            .select('amount')
            .eq('user_id', user.id);

          if (error) throw error;

          const total = ((data ?? []) as Array<{ amount: number }>)
            .reduce((sum, r) => sum + (r?.amount ?? 0), 0);

          if (!cancelled) {
            setXp(total);
            setLoading(false);

            if (total < requiredXP) {
              // Redirect if below threshold
              router.push('/locked').catch(() => {});
            }
          }
        } catch (err) {
          console.error('Supabase error in withXPGuard.tsx:', err);
          if (!cancelled) setLoading(false);
        }
      };

      run();
      return () => {
        cancelled = true;
      };
    }, [user, supabase, router, requiredXP]);

    // Simple gate UI while checking / or if redirecting
    if (loading || !user || xp < requiredXP) {
      return <p>Accessing restricted simulation…</p>;
    }

    // Authorized — render wrapped component with original props
    return <Wrapped {...props} />;
  }

  Guarded.displayName = `withXPGuard(${Wrapped.displayName || Wrapped.name || 'Component'})`;

  return Guarded;
}