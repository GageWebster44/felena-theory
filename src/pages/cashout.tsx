import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUserXP } from '@/hooks/useUserXP';
import deployEngineToAlpaca from '@/lib/engineTransfer';

function CashoutATM() {
export default withGuardianGate(Page);
  const { xp, isLoading: xpLoading } = useUserXP();
  const [status, setStatus] = useState<'idle' | 'connecting' | 'deploying' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [xpToSend, setXpToSend] = useState('');
  const [confirmation, setConfirmation] = useState<{
    xpAmount: number;
    payout: number;
    tier: string;
    timestamp: string;
  } | null>(null);

  const handleCashout = async () => {
    try {
      const xpAmount = parseInt(xpToSend);
      if (isNaN(xpAmount) || xpAmount <= 0 || xpAmount > xp) {
        setError('Invalid XP amount.');
        return;
      }

      setError(null);
      setStatus('connecting');
      await new Promise((r) => setTimeout(r, 1500));

      setStatus('deploying');
      await deployEngineToAlpaca({ engine: 'jarvis', mode: 'live', xp: xpAmount });

      setStatus('done');
      setConfirmation({
        xpAmount,
        payout: xpAmount,
        tier: getTier(xpAmount),
        timestamp: new Date().toLocaleString(),
      });
    } catch (err) {
      setError('Connection failed. The portal did not stabilize.');
      setStatus('idle');
    }
  };

  const getTier = (xp: number): string => {
    if (xp >= 10000) return 'MAX';
    if (xp >= 5000) return 'MAJOR';
    if (xp >= 1000) return 'MINOR';
    return 'BOOST';
  };

  const renderContent = () => {
    if (xpLoading) return <p>🌀 Checking XP balance...</p>;

    if (confirmation) {
      return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

        <div className="text-center">
          <h2 className="text-green-400 text-xl font-bold mb-2">✅ Transfer Complete</h2>
          <strong>{confirmation.xpAmount}</strong> XP has been deployed to the matrix.<br />
          Tier: <strong>{confirmation.tier}</strong><br />
          Confirmed at <span className="text-cyan-300">{confirmation.timestamp}</span>
          <p className="mt-1 text-sm text-gray-400">
            Track progress in your dashboard or engine terminal. The quantum bridge is now active.
            <br />
            🚪 <strong>Note:</strong> This terminal is only accessible through the secure Phone Booth uplink. All real-world XP deployments begin there.
          </p>
        </div>
      );
    }

    if (status === 'deploying') {
      return <p className="text-yellow-300 animate-pulse">🧬 Injecting XP into the Quant Stream...</p>;
    }

    if (status === 'connecting') {
      return <p className="text-cyan-300 animate-pulse">🌐 Connecting to the Real World...</p>;
    }

    const xpAmount = parseInt(xpToSend) || 0;
    const projectedPayout = isNaN(xpAmount) || xpAmount <= 0 ? 0 : xpAmount;
    const tier = getTier(projectedPayout);

    return (
      <>
        <p className="text-white mb-4">
          You have <span className="text-green-400 font-bold">{xp}</span> XP available.
        </p>
        <Input
          type="number"
          value={xpToSend}
          onChange={(e) => setXpToSend(e.target.value)}
          className="bg-zinc-800 text-green-400 border border-green-500"
          placeholder="Enter XP amount"
        />
        <p className="text-green-300 text-md mt-2">
          🧮 Projected Payout: <span className="font-bold">{projectedPayout.toLocaleString()}</span> XP / 🎯 Tier: <strong>{tier}</strong>
        </p>
        <p className="text-sm text-gray-400 mb-4 mt-1">
          XP is your financial code. When deployed, it powers real-world algorithms that trade on your behalf. This is <strong>not a withdrawal</strong> — this is your digital escape.
        </p>
        <Button onClick={handleCashout} className="w-full text-lg bg-green-500 hover:bg-green-600">
          CONNECT TO REAL WORLD
        </Button>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md bg-zinc-900 border border-green-500 border-2 shadow-lg">
        <CardContent className="p-6">
          <h1 className="text-2xl font-mono mb-4 text-green-400 text-center">
            🏧 FELENA ATM: MATRIX CASHOUT
          </h1>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {renderContent()}

          <div className="text-xs text-yellow-400 text-center mt-6">
            <p>⚠️ Caution: XP cannot be reclaimed once deployed. This is a one-way energy transfer into your engine grid.</p>
            <p className="mt-1 text-gray-500 italic">The matrix listens. XP must be spent wisely.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}