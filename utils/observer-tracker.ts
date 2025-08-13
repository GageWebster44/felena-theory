export async function trackObserver(args: { user_id: string; referralCode?: string }) {
  try {
    const payload = {
      user_id: args.user_id,
      referral_code: args.referralCode ?? null,
      visited_at: new Date().toISOString(),
    };

    // TODO: wire to DB if needed
    // await supabase.from('observer_events').insert(payload);
    return payload;
  } catch (error) {
    console.error('observer-tracker error', error);
    throw error;
  }
}
