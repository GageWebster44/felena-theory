export async function logTrade({
  userId,
  symbol,
  side,
  qty,
  price,
  status,
  result,
}: {
  userId: string;
  symbol: string;
  side: 'buy' | 'sell';
  qty: number;
  price: number;
  status: string;
  result?: unknown;
}) {
  try {
    const row = {
      user_id: userId,
      symbol,
      side,
      qty,
      price,
      status, // keep as its own field
      result, // keep as its own field
      created_at: new Date().toISOString(),
    };

    // await supabase.from('trade_logs').insert(row);
    return row;
  } catch (error) {
    console.error('logTrade error', error);
    throw error;
  }
}
