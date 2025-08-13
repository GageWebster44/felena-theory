// middleware.ts (project root)
import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

/* ---------------- Security headers ---------------- */
function withSecurityHeaders(res: NextResponse) {
  // Frame/embed hardening
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
  ].join(','));

  // CSP (relaxed; keep inline/eval off your pages to tighten later)
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "media-src 'self'",
      "font-src 'self'",
      "connect-src 'self' https:",
      "frame-ancestors 'self'",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self'",
    ].join('; ')
  );

  return res;
}

/* ---------------- Route policy ---------------- */

// Public marketing/auth pages that should NEVER redirect to /auth
const PUBLIC_ROUTES: readonly string[] = [
  '/', '/index',                 // landing
  '/privacy', '/terms',          // legal
  '/felena-vision', '/felena-vision/preorder',
  '/kids-zone',                  // public explainer
  '/auth', '/auth/login', '/auth/register', '/auth/callback',
  '/404',
];

// App areas that DO require login
const PROTECTED_ROUTES: readonly string[] = [
  '/dashboard',
  '/admin',
  '/engine-lab',
  '/vault',
  '/xp-center',
  '/dao',
  '/guardian-inbox',
  '/profile',
  '/settings',
  '/keycard',
  '/xp-history',
  '/redeem',
  '/teams',
  '/invite-claim',
  '/cert-log',
];

function pathStartsWithAny(pathname: string, bases: readonly string[]) {
  const path = pathname.replace(/\/+$/, '') || '/';
  return bases.some((b) => {
    const base = b.replace(/\/+$/, '') || '/';
    return path === base || path.startsWith(`${base}/`);
  });
}

/* ---------------- Middleware ---------------- */

export async function middleware(req: NextRequest) {
  // Always start with a pass‑through response so Supabase can set cookies
  const res = withSecurityHeaders(NextResponse.next());

  const pathname = req.nextUrl.pathname;

  // Skip Next.js internals & static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt)$/)
  ) {
    return res;
  }

  // Public pages: never gate them
  if (pathStartsWithAny(pathname, PUBLIC_ROUTES)) {
    // If user is already signed in and tries to visit /auth, push to /dashboard
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user && pathStartsWithAny(pathname, ['/auth'])) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return withSecurityHeaders(NextResponse.redirect(url));
    }

    return res;
  }

  // Everything else: check auth if it’s in the protected list
  if (pathStartsWithAny(pathname, PROTECTED_ROUTES)) {
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth';
      // Optional: send them back after login
      url.searchParams.set('next', pathname);
      return withSecurityHeaders(NextResponse.redirect(url));
    }
  }

  // Not explicitly public or protected? Let it pass.
  return res;
}

/* ---------------- Matchers ----------------
   Run on all routes except common static files.
*/
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|site.webmanifest|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css|js|map)).*)',
  ],
};