 // utils/fetchMarketSignals.ts
import axios from 'axios';

const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
const WATCHLIST = ['GFAI', 'BRSH', 'VRPX']; // Customize for your active symbols

export type MarketSignal = {
  symbol: string;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  lastPrice: number;
  signalStrength: number; // 0-100 scale
  signalType: 'neutral' | 'spike' | 'drop' | 'momentum';
};

export async function fetchMarketSignals(): Promise<MarketSignal[]> {
  const results: MarketSignal[] = [];

  for (const symbol of WATCHLIST) {
    try {
      const quoteRes = await axios.get(
        `https://api.polygon.io/v2/last/nbbo/${symbol}?apiKey=${POLYGON_API_KEY}`
      );

      const book = quoteRes.data?.results;
      const bid = book?.bid?.price || 0;
      const ask = book?.ask?.price || 0;
      const bidSize = book?.bid?.size || 0;
      const askSize = book?.ask?.size || 0;

      const tradeRes = await axios.get(
        `https://api.polygon.io/v3/trades/${symbol}?limit=1&apiKey=${POLYGON_API_KEY}`
      );

      const lastTrade = tradeRes.data?.results?.[0];
      const lastPrice = lastTrade?.p || 0;

      const spread = ask - bid;
      const midpoint = (bid + ask) / 2;
      const delta = lastPrice - midpoint;

      let signalStrength = 50;
      let signalType: MarketSignal['signalType'] = 'neutral';

      if (delta > 0.2 && bidSize > askSize) {
        signalStrength = 75 + Math.min(delta * 100, 25);
        signalType = 'spike';
      } else if (delta < -0.2 && askSize > bidSize) {
        signalStrength = 25 - Math.min(Math.abs(delta) * 100, 25);
        signalType = 'drop';
      } else if (Math.abs(delta) > 0.1) {
        signalType = 'momentum';
        signalStrength = 60;
      }

      results.push({
        symbol,
        bid,
        ask,
        bidSize,
        askSize,
        lastPrice,
        signalStrength,
        signalType,
      });
    } catch (err) {
      console.error(`Polygon API error for ${symbol}:`, err.message);
    }
  }

  return results;
}