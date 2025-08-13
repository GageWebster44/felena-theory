import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUserXP } from '@/hooks/useUserXP';
import deployEngineToAlpaca from '@/lib/engineTransfer';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabaseClient';

function PhoneBooth() {
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
  const router = useRouter();

  useEffect(() => {
    const verifyAccess = async () => {
      const { data: user } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user?.user?.id)
        .single();

      if (!['admin', 'developer'].includes(profile?.role)) {
        router.push('/404');
      }
    };
    verifyAccess();
  }, []);

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
          <h2 className="text-green-400 text-xl font-bold mb-2">📞 UPLINK ESTABLISHED</h2>
          <strong>{confirmation.xpAmount}</strong> XP deployed<br />
          Tier: <strong>{confirmation.tier}</strong><br />
          Timestamp: <span className="text-cyan-300">{confirmation.timestamp}</span>
          <p className="mt-1 text-sm text-gray-400">
            🚪 All real-world XP deposits and withdrawals must originate through this secured uplink.
            <br />
            Track progress in your dashboard or terminal. Override confirmed.
          </p>
        </div>
      );
    }

    if (status === 'deploying') {
      return <p className="text-yellow-300 animate-pulse">📡 Broadcasting override packet...</p>;
    }

    if (status === 'connecting') {
      return <p className="text-cyan-300 animate-pulse">🔌 Establishing uplink channel...</p>;
    }

    const xpAmount = parseInt(xpToSend) || 0;
    const projectedPayout = isNaN(xpAmount) || xpAmount <= 0 ? 0 : xpAmount;
    const tier = getTier(projectedPayout);

    return (
      <>
        <p className="text-white mb-4">
          Available XP: <span className="text-green-400 font-bold">{xp}</span>
        </p>
        <Input
          type="number"
          value={xpToSend}
          onChange={(e) => setXpToSend(e.target.value)}
          className="bg-zinc-800 text-green-400 border border-green-500"
          placeholder="Enter XP to deploy"
        />
        <p className="text-green-300 text-md mt-2">
          📊 Target Tier: <strong>{tier}</strong> | XP: <strong>{projectedPayout}</strong>
        </p>
        <Button onClick={handleCashout} className="w-full text-lg bg-red-600 hover:bg-red-700 mt-4">
          🚨 FORCE ENGINE DEPLOY
        </Button>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md bg-zinc-900 border border-red-600 border-2 shadow-lg">
        <CardContent className="p-6">
          <h1 className="text-2xl font-mono mb-4 text-red-400 text-center">
            ☎️ SECURE UPLINK: PHONE BOOTH OVERRIDE
          </h1>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {renderContent()}
          <div className="text-xs text-yellow-400 text-center mt-6">
            <p>⚠️ Dev/Admin override only. Logs will reflect all uplink activity. Abuse will be traced.</p>
            <p className="mt-1 text-gray-500 italic">This terminal simulates physical access under crisis fallback protocol.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}