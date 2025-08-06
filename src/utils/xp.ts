 export async function getXP(userId: string) {
  try {
    const { data } = await supabase.from('xp_balance').select('amount').eq('user_id', userId).single();
  } catch (error) {
    console.error('❌ Supabase error in xp.ts', error);
  }
  return data?.amount || 0;
}

export async function hasEnoughXP(userId: string, requiredXP: number) {
  const currentXP = await getXP(userId);
  return currentXP >= requiredXP;
}