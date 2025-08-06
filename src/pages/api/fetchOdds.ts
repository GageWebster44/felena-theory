 // /pages/api/fetchOdds.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const ODDS_API_KEY = process.env.ODDS_API_KEY!;
const REGION = 'us'; // or 'uk', 'eu'
const SPORT = 'basketball_nba'; // or 'americanfootball_nfl', etc.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/${SPORT}/odds/?apiKey=${ODDS_API_KEY}&regions=${REGION}&markets=spreads,h2h`
    );
    const data = await response.json();

    res.status(200).json(data);
  } catch (err) {
    console.error('Odds API error:', err);
    res.status(500).json({ error: 'Failed to fetch odds' });
  }
}
