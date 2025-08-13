// errorSignalWatcher.ts – Detect stalled engines or silent signal states

const ERROR_TIMEOUT_MS = 120000; // 2 minutes = 120,000 ms

// In-memory map of engine last-ping timestamps
const lastSignalMap: Record<string, number> = {};

/**
 * Called when an engine successfully emits a signal.
 * Updates the engine's last active timestamp.
 */
export function updateSignalTimestamp(engineId: string) {
  lastSignalMap[engineId] = Date.now();
}

/**
 * Returns a list of engine IDs that have not signaled within the timeout window.
 */
export function getStalledEngines(): string[] {
  const now = Date.now();
  const stalled = Object.entries(lastSignalMap)
    .filter(([_, ts]) => now - ts > ERROR_TIMEOUT_MS)
    .map(([engineId]) => engineId);

  if (stalled.length > 0) {
    console.warn('[SIGNAL WATCH] Stalled engines detected:', stalled);
  }

  return stalled;
}

/**
 * Clears all stored timestamps — use during shutdown or reset.
 */
export function resetAllSignalWatchers() {
  Object.keys(lastSignalMap).forEach((key) => delete lastSignalMap[key]);
}
