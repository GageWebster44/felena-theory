// src/utils/alpacaRouter.ts
import axios from 'axios';

import supabase from './supabaseClient';

export type AlpacaOrderSide = 'buy' | 'sell';
export type AlpacaOrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
export type AlpacaTimeInForce = 'gtc' | 'day' | 'opg' | 'ioc' | 'fok';

export interface RouteOrderParams {
  symbol: string;
  qty: number;
  side: AlpacaOrderSide;
  type?: AlpacaOrderType;
  time_in_force?: AlpacaTimeInForce;
}

export interface AlpacaRouteOk {
  id: string;
  [k: string]: unknown;
}

export interface AlpacaRouteErr {
  error: string;
}

export async function routeOrderToAlpaca({
  symbol,
  qty,
  side,
  type = 'market',
  time_in_force = 'gtc',
}: RouteOrderParams): Promise<AlpacaRouteOk | AlpacaRouteErr> {
  // Require an authenticated user
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    return { error: 'User not authenticated.' };
  }
  const userId = userData.user.id; // Load stored broker creds for this user

  const { data, error } = await supabase
    .from('operators')
    .select('alpaca_key, alpaca_secret')
    .eq('user_id', userId)
    .single();

  if (error || !data?.alpaca_key || !data?.alpaca_secret) {
    return { error: 'Alpaca credentials not found.' };
  }

  try {
    const res = await axios.post('/api/alpaca/order', {
      key: data.alpaca_key,
      secret: data.alpaca_secret,
      orders: [
        {
          symbol,
          qty,
          side,
          type,
          time_in_force,
        },
      ],
    });

    return res.data as AlpacaRouteOk;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('Alpaca route failed:', e);
    return { error: message };
  }
}
