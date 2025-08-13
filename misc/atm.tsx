import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/router';

const tiers = [
  { min: 0, max: 99, label: 'Observer', color: 'text-gray-400' },
  { min: 100, max: 999, label: 'Initiate', color: 'text-blue-400' },
  { min: 1000, max: 4999, label: 'Operator', color: 'text-green-400' },
  { min: 5000, max: 9999, label: 'Override', color: 'text-yellow-400' },
  { min: 10000, max: 24999, label: 'Legendary', color: 'text-red-400' },
  { min: 25000, max: 49999, label: 'Dominator', color: 'text-purple-400' },
  { min: 50000, max: Infinity, label: 'Apex Phantom', color: 'text-pink-400' },
];

function ATMPage() {
export default withGuardianGate(Page);
  const [xp, setXP] = useState(0);
  const tier = tiers.find((t) => xp >= t.min && xp <= t.max);
  const nextTier = tiers.find((t) => t.min > xp);
  const xpToNext = nextTier ? nextTier.min - xp : 0;
  const router = useRouter();

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-mono text-center text-green-400 mb-10">
        💵 XP-TO-CASHOUT SIMULATOR
      </h1>

      <div className="max-w-xl mx-auto text-center">
        <input
          type="number"
          value={xp}
          onChange={(e) => setXP(parseInt(e.target.value))}
          className="bg-black border border-green-500 text-green-400 p-2 rounded w-full"
          placeholder="Enter XP to simulate payout"
        />

        <Card className="mt-6 bg-zinc-900 border border-green-500">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-green-300 mb-2">Projected Outcome</h2>
            <p className="text-white">
              📈 <strong>{xp}</strong> XP = <strong>${xp}</strong> projected payout
            </p>
            <p className="mt-2">
              🎯 Tier: <span className={`${tier?.color || 'text-white'} font-bold`}>{tier?.label}</span>
            </p>
            {nextTier && (
              <p className="text-sm text-gray-400 mt-2">
                You are <span className="text-yellow-300 font-bold">{xpToNext}</span> XP away from
                <span className={`ml-1 ${nextTier.color} font-bold`}>{nextTier.label}</span>
              </p>
            )}
            <button
              onClick={() => router.push('/cashout')}
              className="mt-6 w-full text-white bg-green-600 hover:bg-green-700 py-2 rounded shadow"
            >
              🚀 CONTINUE TO REAL XP CASHOUT
            </button>
          </CardContent>
        </Card>

        <p className="text-xs text-gray-500 mt-6">
          XP powers algorithmic deployment. This is not a withdrawal — this is the code to escape the system.
        </p>
      </div>
    </div>
  );
}