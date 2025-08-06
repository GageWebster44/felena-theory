
// xpMilestoneTracker.ts – Detects custom XP milestones or special events

let milestoneFlags: Record<string, boolean> = {};

const MILESTONES = [250, 500, 777, 1000, 1337, 2000];

export function checkXPMilestones(currentXP: number): string[] {
  const hits: string[] = [];

  for (const mark of MILESTONES) {
    if (currentXP >= mark && !milestoneFlags[mark]) {
      milestoneFlags[mark] = true;
      hits.push(`🔔 XP Milestone: ${mark}`);
    }
  }

  return hits;
}

export function resetMilestoneFlags() {
  milestoneFlags = {};
}
