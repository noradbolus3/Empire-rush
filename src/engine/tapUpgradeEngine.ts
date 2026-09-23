import { TAP_VALUE_CAP } from './economyPlan';

export { TAP_VALUE_CAP } from './economyPlan';
export const INITIAL_TAP_VALUE = 1;

export function tapUpgradeCost(level: number): number {
  return Math.round(100 * Math.pow(1.27, Math.max(0, level)));
}

export function tapUpgradeGain(level: number, currentValue: number): number {
  return Number(Math.min(TAP_VALUE_CAP - currentValue, 0.5 * Math.pow(1.08, Math.max(0, level))).toFixed(2));
}
