// src/utils/roleManager.ts
// Simple helpers for reading/updating a user's role in Supabase.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
);

// Adjust to match the roles your app supports.
// If you have a dedicated roles.ts, you can import from there instead.
export type UserRole = 'guest' | 'member' | 'operator' | 'engineer' | 'admin' | 'developer';

type Ok<T> = { ok: true; data: T };
type Fail = { ok: false; error: string };
type Result<T> = Ok<T> | Fail;

/** Update a user's role (table: user_profiles, columns: id, role). */
export default async function assignRole(userId: string, newRole: UserRole): Promise<Result<null>> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) return { ok: false, error: error.message };
    return { ok: true, data: null };
  } catch (err) {
    console.error('✖ Supabase error in roleManager.ts', err);
    return { ok: false, error: (err as Error).message };
  }
}

/** Fetch a user's current role. */
export async function getUserRole(userId: string): Promise<Result<UserRole | null>> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, data: (data?.role as UserRole | null) ?? null };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** List users that have a given role. */
export async function listUsersByRole(
  role: UserRole,
): Promise<Result<Array<{ id: string; role: UserRole }>>> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, role')
      .eq('role', role);

    if (error) return { ok: false, error: error.message };
    // Cast is safe because we filter by role.
    return { ok: true, data: (data ?? []) as Array<{ id: string; role: UserRole }> };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** Convenience check: does the user have the target role? */
export async function userHasRole(userId: string, role: UserRole): Promise<Result<boolean>> {
  const res = await getUserRole(userId);
  if (!res.ok) return res;
  return { ok: true, data: res.data === role };
}

/** Convenience check: is the user an admin/developer? */
export async function userIsAdmin(userId: string): Promise<Result<boolean>> {
  const res = await getUserRole(userId);
  if (!res.ok) return res;
  const r = res.data;
  return { ok: true, data: r === 'admin' || r === 'developer' };
}
