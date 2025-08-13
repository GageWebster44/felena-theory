// src/utils/WithRoleGuard.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

export type Role = string;

// Browser Supabase client (no external import needed)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase =
  SUPABASE_URL && SUPABASE_ANON ? createClient(SUPABASE_URL, SUPABASE_ANON) : null;

/**
 * Wraps a page/component and enforces allowed roles.
 * - No generics → avoids TS2322 with JSX.IntrinsicAttributes
 * - Renders null while checking
 * - Redirects on unauth/unauthorized
 */
export default function WithRoleGuard(
  Component: React.ComponentType<any>,
  allowedRoles: Role[] = []
) {
  const ProtectedComponent: React.FC<any> = (props) => {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      let alive = true;

      async function checkAccess() {
        try {
          // If supabase env isn’t configured, just allow render (no hard crash)
          if (!supabase) {
            if (alive) setChecking(false);
            return;
          }

          // 1) Must be signed in
          const { data: auth } = await supabase.auth.getUser();
          const user = auth?.user;
          if (!user) {
            if (!alive) return;
            router.replace('/onboarding'); // or '/login'
            return;
          }

          // 2) Fetch role from profile (adjust table/columns to your schema)
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            // eslint-disable-next-line no-console
            console.error('[WithRoleGuard] profile fetch error:', error);
            if (!alive) return;
            router.replace('/dashboard');
            return;
          }

          const role: Role = (profile?.role as Role) ?? 'public';

          // 3) Enforce allowed roles if provided
          if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
            if (!alive) return;
            router.replace('/dashboard');
            return;
          }
        } finally {
          if (alive) setChecking(false);
        }
      }

      checkAccess();
      return () => {
        alive = false;
      };
    }, [router, allowedRoles]);

    if (checking) return null; // tiny guard while checking
    return <Component {...props} />;
  };

  ProtectedComponent.displayName = `WithRoleGuard(${
    Component.displayName ?? Component.name ?? 'Component'
  })`;

  return ProtectedComponent;
}