export const MAX_OFFLINE_HOURS = 24;
export const MAX_OFFLINE_SECONDS = MAX_OFFLINE_HOURS * 60 * 60;
export const CLOCK_ROLLBACK_TOLERANCE_MS = 5_000;

export function calculateOfflineSeconds(nowMs: number, savedAtMs: number, clockTampered = false): number {
  if (clockTampered || !Number.isFinite(nowMs) || !Number.isFinite(savedAtMs)) return 0;
  const elapsedMs = nowMs - savedAtMs;
  if (elapsedMs < -CLOCK_ROLLBACK_TOLERANCE_MS) return 0;
  return Math.min(MAX_OFFLINE_SECONDS, Math.max(0, elapsedMs / 1000));
}

export function calculateOfflineHours(nowMs: number, savedAtMs: number, clockTampered = false): number {
  return Math.floor(calculateOfflineSeconds(nowMs, savedAtMs, clockTampered) / 3600);
}
