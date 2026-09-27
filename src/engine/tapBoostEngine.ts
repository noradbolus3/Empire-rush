export const TAP_BOOST_MULTIPLIER = 2;
export const TAP_BOOST_DURATION_MINUTES = 12;
export const TAP_BOOST_DURATION_MS = TAP_BOOST_DURATION_MINUTES * 60 * 1000;

export function startTapBoost(gameTimestamp: number): number {
  const safeTimestamp = Number.isFinite(gameTimestamp) ? gameTimestamp : 0;
  return safeTimestamp + TAP_BOOST_DURATION_MS;
}

export function isTapBoostActive(gameTimestamp: number, boostUntil: number): boolean {
  return Number.isFinite(boostUntil) && Number.isFinite(gameTimestamp) && gameTimestamp < boostUntil;
}

export function tapBoostMultiplier(gameTimestamp: number, boostUntil: number): number {
  return isTapBoostActive(gameTimestamp, boostUntil) ? TAP_BOOST_MULTIPLIER : 1;
}
