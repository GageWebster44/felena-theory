 import axios from 'axios';
import supabase from './supabaseClient';

export async function routeOrderToAlpaca(
  symbol: string,
  qty: number,
  side: 'buy' | 'sell',
  type: 'market' | 'limit' = 'market',
  time_in_force: 'gtc' | 'day' = 'gtc'
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated.');

    const { data, error } = await supabase
      .from('operators')
      .select('alpaca_key, alpaca_secret')
      .eq('id', user.id)
      .single();

    if (error || !data?.alpaca_key || !data?.alpaca_secret) {
      throw new Error('Alpaca credentials not found.');
    }

    const res = await axios.post('/api/alpaca/order', {
      key: data.alpaca_key,
      secret: data.alpaca_secret,
      order: {
        symbol,
        qty,
        side,
        type,
        time_in_force
      }
    });

    return res.data;
  } catch (err: any) {
    console.error('Alpaca route failed:', err.message);
    return { error: err.message };
  }
}
