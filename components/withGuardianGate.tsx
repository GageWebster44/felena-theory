// src/components/withGuardianGate.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

/**
 * Routes that should ALWAYS be public (never blocked by the guardian gate).
 * Keep this list in sync with your marketing site pages.
 */
const PUBLIC_ROUTES: readonly string[] = [
  '/',               // index landing page (official website)
  '/index',          // in case someone routes here explicitly
  '/auth', '/auth/login', '/auth/register',
  '/privacy', '/terms',
  '/felena-vision', '/felena-vision/preorder',
  '/kids-zone',      // the public-facing explainer for Kidzone
  '/404', '/_error',
];

/** Exact/base-or-child match helper */
function isPublicPath(pathname: string): boolean {
  // normalize trailing slash
  const path = pathname.replace(/\/+$/, '') || '/';
  return PUBLIC_ROUTES.some((base) => {
    const b = base.replace(/\/+$/, '') || '/';
    return path === b || path.startsWith(`${b}/`);
  });
}

/**
 * HOC: wraps a page/component and enforces the "guardian" (child) gate.
 * - If localStorage.isChild === 'true' and route is NOT public, redirect to /guardian-gate
 * - Public routes always pass through
 * - On the server (SSR) we never block; we decide on the client
 */
export default function withGuardianGate<P extends object>(
  Wrapped: React.ComponentType<P>
) {
  const GateWrapper: React.FC<P> = (props: P) => {
    const router = useRouter();
    const [checked, setChecked] = useState(false);
    const [allowed, setAllowed] = useState(true);

    useEffect(() => {
      let cancelled = false;

      // SSR guard – only run in the browser
      if (typeof window === 'undefined') {
        if (!cancelled) {
          setAllowed(true);
          setChecked(true);
        }
        return () => { cancelled = true; };
      }

      try {
        const path = router.pathname;
        // Public pages are always allowed
        if (isPublicPath(path)) {
          if (!cancelled) {
            setAllowed(true);
            setChecked(true);
          }
          return;
        }

        // Check child lock
        const isChild = window.localStorage.getItem('isChild') === 'true';

        if (isChild) {
          // Already on the gate? Don't loop.
          if (path !== '/guardian-gate') {
            router.replace('/guardian-gate');
            if (!cancelled) {
              setAllowed(false);
              setChecked(true);
            }
            return;
          }
        }

        if (!cancelled) {
          setAllowed(true);
          setChecked(true);
        }
      } catch (err) {
        // Fail-open: if something breaks, allow the page but log it
        // eslint-disable-next-line no-console
        console.error('withGuardianGate check failed', err);
        if (!cancelled) {
          setAllowed(true);
          setChecked(true);
        }
      }

      return () => { cancelled = true; };
    }, [router.pathname]);

    // Lightweight placeholder while deciding
    if (!checked) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            background: '#000',
            color: '#0f0',
            fontFamily: 'monospace',
          }}
        >
          <p>Verifying…</p>
        </div>
      );
    }

    return allowed ? <Wrapped {...(props as P)} /> : null;
  };

  GateWrapper.displayName = `withGuardianGate(${
    (Wrapped as any).displayName || Wrapped.name || 'Component'
  })`;

  return GateWrapper;
}