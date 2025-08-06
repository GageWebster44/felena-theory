// lib/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers/nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: session } = await supabase.auth.getSession();
  const pathname = req.nextUrl.pathname;

  // 🔐 Pages that require login
  const protectedRoutes = [
    '/dashboard',
    '/admin',
    '/xp-center',
    '/engine-lab',
    '/vault',
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

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  const { data: profileData } = await supabase
    .from('user_profiles')
    .select('role, xp, is_child')
    .eq('id', session?.user.id)
    .single();

  const role = profileData?.role || 'public';
  const xp = profileData?.xp || 0;
  const isChild = profileData?.is_child || false;

  // 🧒 Guardian-locked pages
  const childBlockedPaths = ['/vault', '/xp-center', '/dao'];
  if (isChild && childBlockedPaths.some((p) => pathname.startsWith(p))) {
    console.warn(`[BLOCKED - CHILD ACCESS] Path: ${pathname} | User: ${session?.user.id}`);
    return NextResponse.redirect(new URL('/403', req.url));
  }

  // 👨‍💻 Admin-only lock
  if (pathname.startsWith('/admin') && role !== 'admin') {
    console.warn(`[403 - ADMIN ONLY] Path: ${pathname} | Role: ${role}`);
    return NextResponse.redirect(new URL('/403', req.url));
  }

  // 🧪 Developer-only or XP 100K+
  if (pathname === '/engine-lab' && role !== 'developer' && xp < 100000) {
    console.warn(`[403 - ENGINE LAB BLOCKED] XP: ${xp} | Role: ${role}`);
    return NextResponse.redirect(new URL('/403', req.url));
  }

  // 👨‍👧 Guardian panel
  if (pathname.startsWith('/guardian-inbox') && !['guardian', 'admin'].includes(role)) {
    console.warn(`[403 - GUARDIAN ONLY] Role: ${role}`);
    return NextResponse.redirect(new URL('/403', req.url));
  }

  // 🗳 DAO minimum XP: 1000
  if (pathname.startsWith('/dao') && xp < 1000) {
    console.warn(`[403 - DAO XP GATE] User XP: ${xp}`);
    return NextResponse.redirect(new URL('/403', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/engine-lab',
    '/xp-center',
    '/vault',
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
  ],
};