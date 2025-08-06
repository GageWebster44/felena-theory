import { executeTrade } from './executeTrade';
import { updateXP } from './updateXP';
import { logSessionEvent } from './logSessionToSupabase';
import { logDailyXP } from './dailyLogger';
import { checkCrateMilestone } from './crateTrigger';
import { playCrateSound } from './playCrateSound';
import { logCrateUnlock } from './crateHistory';
import { checkXPMilestones } from './xpMilestoneTracker';
import { checkCashoutStatus } from './xpCashoutTrigger';
import { logRewardClaim } from './rewardClaimLogger';
import { updateSignalTimestamp } from './errorSignalWatcher';
import { auditXPIntegrity } from './xpAuditor';
import { assignDynamicCrate } from './dynamicCrateAssigner';
import { updateEngineHealthScore } from './engineHealthTracker';
import { trackBehavioralAnomaly } from './behaviorAnomalyLogger';
import { notifyUser } from './notifyUser';
import { logEngineStats } from './engineStatsLogger';
import { trackUplinkXP } from './uplinkXPFlow';

export async function xpEngineOrchestrator({
  engine,
  engineKey,
  data,
  userId,
  override
}: {
  engine: any;
  engineKey: string;
  data: any[];
  userId: string;
  override: boolean;
}) {
  const result = await engine.runEngine(data, executeTrade, updateXP, userId);
  const signalCount = result?.signals?.length || 0;
  const avgConfidence = result?.signals?.reduce((sum, s) => sum + s.confidence, 0) / signalCount || 0;
  const xp = override ? Math.floor(avgConfidence * 200) : Math.floor(avgConfidence * 100);

  if (signalCount > 0) {
    await updateXP(userId, xp);
    await logSessionEvent({ userId, engine: engineKey, xp, signalCount, overrideActive: override });
    await logDailyXP(userId, xp);
    updateSignalTimestamp(engineKey);
    trackUplinkXP(userId, xp);
    logEngineStats(userId, engineKey, result);
    auditXPIntegrity(userId);
    trackBehavioralAnomaly(userId, result);

    const milestone = checkCrateMilestone(xp);
    if (milestone.triggered) {
      playCrateSound(milestone.tier);
      await logCrateUnlock(userId, milestone.tier);
    }

    const dynamicCrate = await assignDynamicCrate(userId, engineKey, xp);
    if (dynamicCrate) {
      await logCrateUnlock(userId, dynamicCrate);
    }

    const xpHits = checkXPMilestones(xp);

    const cashout = checkCashoutStatus(xp);
    if (cashout.eligible) {
      notifyUser(userId, `💸 XP threshold met for ${cashout.tier} cashout!`);
    }

    updateEngineHealthScore(engineKey, avgConfidence, result);
  }

  return result;
}