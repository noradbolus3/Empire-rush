export const TAP_BOOST_MULTIPLIER = 2;
export const TAP_BOOST_DURATION_MINUTES = 12;
export const TAP_BOOST_DURATION_MS = TAP_BOOST_DURATION_MINUTES * 60 * 1000;

export function startTapBoost(timestamp: number): number {
  const safeTimestamp = Number.isFinite(timestamp) ? timestamp : 0;
  return safeTimestamp + TAP_BOOST_DURATION_MS;
}

export function isTapBoostActive(timestamp: number, boostUntil: number): boolean {
  return Number.isFinite(boostUntil) && Number.isFinite(timestamp) && timestamp < boostUntil;
}

export function tapBoostMultiplier(timestamp: number, boostUntil: number): number {
  return isTapBoostActive(timestamp, boostUntil) ? TAP_BOOST_MULTIPLIER : 1;
}
