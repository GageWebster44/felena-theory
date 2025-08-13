// pages/sandbox.tsx
import React, { useEffect, useState, useContext } from "react";
import Head from "next/head";
import { createClient } from "@supabase/supabase-js";
import { withGuardianGate } from "@/components/withGuardianGate";
import EngineConsoleOverlay from "@/components/EngineConsoleOverlay";
import deployEngineToAlpaca from "@/lib/engineTransfer";
import { UserXPContext } from "./_app";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

function Sandbox() {
  const { devKey, userXP } = useContext(UserXPContext);

  const [xp, setXP] = useState<number>(0);
  const [walletXP, setWalletXP] = useState<number>(0);
  const [badge, setBadge] = useState<string>("None");
  const [log, setLog] = useState<string[]>([]);
  const [realXPOverride, setRealXPOverride] = useState<boolean>(false);
  const [crateTrigger, setCrateTrigger] = useState<boolean>(false);
  const [missionSim, setMissionSim] = useState<boolean>(false);
  const [crateType, setCrateType] = useState<"Mini" | "Major" | "Max">("Major");

  // ---- Load wallet on mount + every 10s ----
  useEffect(() => {
    loadWallet();
    const sync = setInterval(loadWallet, 10_000);
    return () => clearInterval(sync);
  }, []);

  const loadWallet = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: wallet, error } = await supabase
      .from("xp_wallet")
      .select("xp")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.warn("xp_wallet fetch error:", error.message);
      return;
    }
    setWalletXP(wallet?.xp ?? 0);
  };

  const logLine = (msg: string) =>
    setLog((prev) => [`${new Date().toLocaleTimeString()}  ${msg}`, ...prev]);

  // ---- Local + (optional) real XP injection ----
  const simulateAction = async (label: string, delta: number) => {
    const newXP = xp + delta;
    setXP(newXP);
    logLine(`+${delta} XP → ${label} | local total: ${newXP}`);

    if (!realXPOverride) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const type = label.toLowerCase().replace(/\s+/g, "_");

      const { error: logErr } = await supabase.from("xp_log").insert({
        user_id: user.id,
        type,
        amount: delta,
        description: `${label} +${delta} XP`,
        created_at: new Date().toISOString(),
      });
      if (logErr) throw logErr;

      const { error: upsertErr } = await supabase.from("xp_wallet").upsert(
        {
          user_id: user.id,
          xp: (walletXP ?? 0) + delta,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      if (upsertErr) throw upsertErr;

      setWalletXP((w) => (w ?? 0) + delta);
      logLine(`(REAL) persisted +${delta} XP for ${label}`);
    } catch (err: any) {
      console.error("Supabase error in sandbox.tsx", err);
      logLine(`❌ Supabase error: ${err?.message ?? err}`);
    }
  };

  const triggerCrateDrop = async () => {
    setCrateTrigger(true);
    await new Promise((r) => setTimeout(r, 1200));
    setCrateTrigger(false);
    logLine(`🎁 Crate drop simulated: ${crateType}`);
  };

  const simulateMission = () => {
    setMissionSim(true);
    logLine("🛰️ Mission module triggered");
    setTimeout(() => setMissionSim(false), 1000);
  };

  const injectBadge = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase.from("xp_badges").insert({
        user_id: user.id,
        label: badge,
        issued_at: new Date().toISOString(),
      });
      if (error) throw error;
      logLine(`🏅 Badge granted: ${badge}`);
    } catch (err: any) {
      console.error("Supabase error (badge)", err);
      logLine(`❌ Badge insert error: ${err?.message ?? err}`);
    }
  };

  const simulateEngineDeploy = async () => {
    try {
      await deployEngineToAlpaca({ engine: "jarvis", mode: "test", xp: 123 });
      logLine("⚙️ Engine deployment test fired (jarvis, 123 XP)");
    } catch (e: any) {
      console.error("deployEngineToAlpaca error", e);
      logLine(`❌ Engine deploy error: ${e?.message ?? e}`);
    }
  };

  const exportLog = () => {
    const text = log.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sandbox_log.txt";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!devKey) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex items-center justify-center font-mono">
        🔴 Developer access only
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 font-mono">
      <Head>
        <title>🧪 SANDBOX</title>
      </Head>

      <h1 className="text-3xl text-green-400 mb-2">🧪 SANDBOX</h1>
      <p className="text-sm text-gray-400 mb-6">
        Dev/test mode. Local XP: {xp} | Wallet XP: {walletXP}
      </p>
      <p className="text-yellow-300 text-sm mb-4">
        ⚠️ Developer-only simulation tools. Toggle REAL XP to persist to your account.
      </p>

      <button
        onClick={() => setRealXPOverride((v) => !v)}
        className={`px-4 py-2 text-sm rounded mb-6 ${
          realXPOverride ? "bg-red-700" : "bg-green-600"
        }`}
      >
        {realXPOverride ? "REAL XP MODE ON" : "SANDBOX ONLY"}
      </button>

      {/* Mockable Engine Overlay (visual tiers/ETA right away) */}
      <div className="mb-8">
        <EngineConsoleOverlay mockMode={true} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => simulateAction("Market Scan", 10)}
          className="bg-green-600 px-4 py-2 rounded"
        >
          📈 Market +10 XP
        </button>
        <button
          onClick={() => simulateAction("Mission Complete", 25)}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          🎯 Mission +25 XP
        </button>
        <button
          onClick={() => simulateAction("Engine Trigger", 40)}
          className="bg-purple-600 px-4 py-2 rounded"
        >
          ⚙️ Engine +40 XP
        </button>
        <button
          onClick={() => simulateAction("PVP Victory", 75)}
          className="bg-red-600 px-4 py-2 rounded"
        >
          🏆 PVP Win +75 XP
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <select
          value={crateType}
          onChange={(e) => setCrateType(e.target.value as any)}
          className="bg-black border border-green-500 px-2 py-1 rounded"
        >
          <option value="Mini">Mini</option>
          <option value="Major">Major</option>
          <option value="Max">Max</option>
        </select>

        <button onClick={triggerCrateDrop} className="bg-yellow-500 px-4 py-2 rounded">
          🎁 Simulate Crate
        </button>

        <button onClick={simulateMission} className="bg-cyan-500 px-4 py-2 rounded">
          🛰️ Trigger Mission
        </button>

        <button onClick={simulateEngineDeploy} className="bg-pink-500 px-4 py-2 rounded">
          🚀 Simulate Deploy
        </button>
      </div>

      <div className="mb-8">
        <label className="text-sm text-gray-400 block mb-1">🎖 Badge Label</label>
        <input
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          className="bg-black border border-green-400 px-2 rounded text-green-300 w-full"
          placeholder="Tactician / Overseer / etc"
        />
        <button onClick={injectBadge} className="bg-pink-600 px-4 py-2 rounded mt-2">
          🏅 Inject Badge
        </button>
      </div>

      <h2 className="text-xl text-green-300 mb-2">🧾 Simulation Log</h2>
      <div className="bg-black/70 border border-neutral-800 p-4 rounded h-56 overflow-y-auto text-sm text-green-300">
        {log.length === 0 ? <p>🚫 No logs yet.</p> : log.map((l, i) => <p key={i}>{l}</p>)}
      </div>

      <button onClick={exportLog} className="text-sm text-blue-400 underline mt-4">
        ⬇️ Export Log
      </button>
    </div>
  );
}

export default withGuardianGate(Sandbox);