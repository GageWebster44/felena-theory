import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabaseClient';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const enforceGuardianRules = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_kid_verified, age_verified')
        .eq('id', user.id)
        .single();

      const path = router.pathname;
      const restrictedRoutes = [
        '/dao', '/cashout', '/arena', '/admin', '/xp-shop', '/override', '/guardian-inbox',
      ];

      const kidOnlyRoutes = [
        '/xp-quiz', '/vault', '/guardian-gate', '/kids-zone', '/edu-games'
      ];

      if (profile?.is_kid_verified && !kidOnlyRoutes.includes(path)) {
        router.push('/guardian-gate');
      }

      if (restrictedRoutes.includes(path) && profile?.is_kid_verified) {
        router.push('/guardian-gate');
      }
    };

    enforceGuardianRules();
  }, [router]);

  return <>{children}</>;
}