export const STARTING_CASH = 1_000;
export const RETAIL_ENTRY_COST = 500;
export const RETAIL_INITIAL_STOCK_COST = 500;
export const IPO_MIN_NET_WORTH = 10_000_000;
export const IPO_MIN_VALUATION = 10_000_000;
export const IPO_MAX_VALUATION_TO_NET_WORTH_MULTIPLE = 4;
export const IPO_MAX_NET_WORTH_PROCEEDS_MULTIPLE = 0.5;
export const CASINO_UNLOCK_NET_WORTH = 100_000;
export const TAP_VALUE_CAP = 10;
export const TAP_SOFT_START_TAPS = 10;
export const TAP_REWARD_FLOOR = 0.25;
export const PASSIVE_INCOME_CAP = 4;
export const BILLIONAIRE_TARGET = 1_000_000_000;

export function tapRewardMultiplier(tapsToday: number): number {
  const safeTaps = Math.max(0, Number.isFinite(tapsToday) ? tapsToday : 0);
  if (safeTaps <= TAP_SOFT_START_TAPS) return 1;
  return Number(Math.max(TAP_REWARD_FLOOR, 1 - (safeTaps - TAP_SOFT_START_TAPS) * 0.025).toFixed(3));
}

export function passiveIncomeMultiplier(netWorth: number): number {
  return Number(Math.min(PASSIVE_INCOME_CAP, Math.pow(1 + Math.max(0, Number.isFinite(netWorth) ? netWorth : 0) / 100_000, 0.22)).toFixed(4));
}
