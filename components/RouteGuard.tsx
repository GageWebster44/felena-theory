// src/components/RouteGuard.tsx
// Lightweight client-side route guard for Next.js + Supabase

import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import supabase from '@/utils/supabaseClient';

type Props = { children: ReactNode };

/** Pages that should NEVER be blocked by the guard */
const PUBLIC_ROUTES = new Set<string>([
  '/404',
  '/auth/login',
  '/auth/register',
  '/auth/verify',
  '/guardian-gate',
  '/guardian-verify',
  '/preorder',
  '/apply',
  '/legal',
  '/games', // public landing for games list
]);

/** Pages only kids can access (optional; keep if you use this concept) */
const KID_ONLY_ROUTES = new Set<string>(['/vault', '/guardian-gate', '/kids-zone', '/games/*']);

/** Pages that require adult/guardian verification */
const RESTRICTED_ROUTES = new Set<string>([
  '/dao',
  '/cashout',
  '/arena',
  '/admin',
  '/xp-shop',
  '/override',
  '/guardian-inbox',
  '/account',
  '/dashboard',
]);

/** Utility: normalize path (strip query/hash) */
function normalize(path: string): string {
  const q = path.split('?')[0].split('#')[0];
  return q.endsWith('/') && q !== '/' ? q.slice(0, -1) : q;
}

/** Utility: simple "set has with glob suffix /*" */
function setHasPathOrGlob(s: Set<string>, path: string): boolean {
  if (s.has(path)) return true; // check simple /* globs
  for (const p of s) {
    if (p.endsWith('/*')) {
      const base = p.slice(0, -2);
      if (path === base || path.startsWith(base + '/')) return true;
    }
  }
  return false;
}

export default function RouteGuard({ children }: Props) {
  const router = useRouter();
  const lastRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    // Only run client-side and when router is ready
    if (typeof window === 'undefined' || !router.isReady) return;

    const enforce = async () => {
      const path = normalize(router.pathname); // Never guard public pages

      if (setHasPathOrGlob(PUBLIC_ROUTES, path)) return; // ---- Auth gate --------------------------------------------------------

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // avoid redirect ping‑pong
        if (lastRedirectRef.current !== '/auth/login') {
          lastRedirectRef.current = '/auth/login';
          router.replace('/auth/login');
        }
        return;
      } // ---- Profile flags ----------------------------------------------------

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_kid_verified, age_verified')
        .eq('id', user.id)
        .single();

      const isKidVerified = profile?.is_kid_verified === true;
      const ageVerified = profile?.age_verified === true; // ---- Kid‑only routes (optional) --------------------------------------

      if (setHasPathOrGlob(KID_ONLY_ROUTES, path) && !isKidVerified) {
        if (lastRedirectRef.current !== '/guardian-gate') {
          lastRedirectRef.current = '/guardian-gate';
          router.replace('/guardian-gate');
        }
        return;
      } // ---- Restricted adult routes -----------------------------------------

      if (setHasPathOrGlob(RESTRICTED_ROUTES, path) && !ageVerified) {
        if (lastRedirectRef.current !== '/guardian-gate') {
          lastRedirectRef.current = '/guardian-gate';
          router.replace('/guardian-gate');
        }
        return;
      } // If we get here, allow the page

      lastRedirectRef.current = null;
    };

    void enforce(); // Re‑check on actual path changes
  }, [router.isReady, router.pathname]); // safe deps

  return <>{children}</>;
}
