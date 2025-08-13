// src/lib/server/getSessionUser.ts
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Fetch the currently signed-in user from a Next.js API route.
 * Returns `null` when not authenticated or on error.
 */
export default async function getSessionUser(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<User | null> {
  try {
    const supabase = createServerSupabaseClient({ req, res });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      // Useful in dev; stays quiet in prod logs unless you surface it
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[getSessionUser] auth.getUser error:', error.message);
      }
      return null;
    }

    return user ?? null;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[getSessionUser] unexpected error:', err);
    }
    return null;
  }
}
