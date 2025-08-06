// utils/observer-tracker.ts
import { supabase } from '@/utils/supabaseClient';

export async function logObserverVisit() {
  try {
    const ip = await fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => data.ip);

    const referralCode = localStorage.getItem('referralCode') || null;

  try {
    await supabase.from('observer_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in observer-tracker.ts', error);
  }
      ip_address: ip,
      referral_code: referralCode,
      visited_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Failed to log observer visit:', err);
  }
}