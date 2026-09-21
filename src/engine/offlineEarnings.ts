export const MAX_OFFLINE_SECONDS = 24 * 60 * 60;
export const CLOCK_ROLLBACK_TOLERANCE_MS = 60 * 60 * 1000;

export function calculateOfflineSeconds(nowMs: number, savedAtMs: number, clockTampered = false): number {
  if (clockTampered || !Number.isFinite(nowMs) || !Number.isFinite(savedAtMs)) return 0;
  const elapsedMs = nowMs - savedAtMs;
  if (elapsedMs < -CLOCK_ROLLBACK_TOLERANCE_MS) return 0;
  return Math.min(MAX_OFFLINE_SECONDS, Math.max(0, elapsedMs / 1000));
}

export function calculateOfflineReward(nowMs: number, savedAtMs: number, hourlyNetProfit: number, clockTampered = false): number {
  const seconds = calculateOfflineSeconds(nowMs, savedAtMs, clockTampered);
  if (!Number.isFinite(hourlyNetProfit) || hourlyNetProfit <= 0) return 0;
  return Number((seconds * hourlyNetProfit / 3600).toFixed(2));
}
