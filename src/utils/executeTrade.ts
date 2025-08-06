
// executeTrade.ts – Handles Alpaca paper trading

import axios from 'axios';

const ALPACA_API_KEY = process.env.NEXT_PUBLIC_ALPACA_API_KEY;
const ALPACA_SECRET_KEY = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY;
const BASE_URL = 'https://paper-api.alpaca.markets/v2';

export async function executeTrade(order: {
  symbol: string;
  qty: number;
  side: 'buy' | 'sell';
  type?: string;
  time_in_force?: string;
}) {
  try {
    const res = await axios.post(\`\${BASE_URL}/orders\`, {
      symbol: order.symbol,
      qty: order.qty,
      side: order.side,
      type: order.type || 'market',
      time_in_force: order.time_in_force || 'gtc',
    }, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
        'Content-Type': 'application/json'
      }
    });

    return res.data;
  } catch (err: any) {
    console.error('[TRADE FAILED]', err?.response?.data || err.message);
    return null;
  }
}
