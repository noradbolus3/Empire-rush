export const TAP_VALUE_CAP = 25;
export const INITIAL_TAP_VALUE = 1;

export function tapUpgradeCost(level: number): number {
  return Math.round(160 * Math.pow(1.4, Math.max(0, level)));
}

export function tapUpgradeGain(level: number, currentValue: number): number {
  return Number(Math.min(TAP_VALUE_CAP - currentValue, 0.5 * Math.pow(1.08, Math.max(0, level))).toFixed(2));
}
