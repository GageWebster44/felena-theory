// src/components/AnonOnly.tsx
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import supabase from '@/utils/supabaseClient';

type Props = {
  children: React.ReactNode;
};

/**
 * Renders children only for anonymous (not signed-in) visitors.
 * If a user is already signed in, immediately redirect to /dashboard.
 */
export default function AnonOnly({ children }: Props) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!cancelled && data?.user) {
        router.replace('/dashboard');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return <>{children}</>;
}
