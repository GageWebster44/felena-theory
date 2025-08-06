import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function assignRole(userId: string, newRole: string) {
  try {
    await supabase.from('user_profiles').update({ role: newRole }).eq('id', userId);
  } catch (error) {
    console.error('❌ Supabase error in roleManager.ts', error);
  }
}