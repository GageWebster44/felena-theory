 // pages/api/alpaca/order.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { key, secret, order } = req.body;

  if (!key || !secret || !order) {
    return res.status(400).json({ error: 'Missing API credentials or order data' });
  }

  try {
    const alpacaUrl = 'https://paper-api.alpaca.markets/v2/orders'; // Use paper endpoint for dev

    const alpacaRes = await axios.post(alpacaUrl, order, {
      headers: {
        'APCA-API-KEY-ID': key,
        'APCA-API-SECRET-KEY': secret,
        'Content-Type': 'application/json',
      },
    });

    return res.status(200).json(alpacaRes.data);
  } catch (err: any) {
    console.error('Alpaca API error:', err.response?.data || err.message);
    return res.status(500).json({ error: err.response?.data || 'Alpaca order failed' });
  }
}
