export const GAME_DAY_SETTLEMENTS = 1;
export const GAME_DAYS_PER_MONTH = 30;
export const GAME_DAYS_PER_QUARTER = 90;
export const GAME_DAYS_PER_YEAR = 360;
export const REAL_MS_PER_SETTLEMENT = 60 * 60 * 1000;

/**
 * The counter is the number of completed hourly settlements. Counter 0 is
 * Year 1 / Month 1 / Day 1; every completed settlement advances one game day.
 */
export function safeGameDayCounter(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

export function gameCalendarPosition(completedSettlements: number) {
  const counter = safeGameDayCounter(completedSettlements);
  const completedThisYear = counter % GAME_DAYS_PER_YEAR;
  return {
    year: Math.floor(counter / GAME_DAYS_PER_YEAR) + 1,
    month: Math.floor(completedThisYear / GAME_DAYS_PER_MONTH) + 1,
    day: (completedThisYear % GAME_DAYS_PER_MONTH) + 1,
    completedSettlements: counter,
  };
}

export function formatGameDate(completedSettlements: number): string {
  const position = gameCalendarPosition(completedSettlements);
  return `Year ${position.year} · Month ${position.month} · Day ${position.day}`;
}

export function gameQuarterKey(completedSettlements: number): string {
  const counter = safeGameDayCounter(completedSettlements);
  const withinYear = counter % GAME_DAYS_PER_YEAR;
  const quarter = Math.floor(withinYear / GAME_DAYS_PER_QUARTER) + 1;
  const year = Math.floor(counter / GAME_DAYS_PER_YEAR) + 1;
  return `Y${year}-Q${quarter}`;
}

/** Days until the next quarter boundary; at a boundary, returns a full quarter. */
export function daysUntilNextGameQuarter(completedSettlements: number): number {
  const counter = safeGameDayCounter(completedSettlements);
  return GAME_DAYS_PER_QUARTER - (counter % GAME_DAYS_PER_QUARTER);
}

export function isGameQuarterBoundary(completedSettlements: number): boolean {
  const counter = safeGameDayCounter(completedSettlements);
  return counter > 0 && counter % GAME_DAYS_PER_QUARTER === 0;
}

/**
 * Convert an old real-calendar monthly due timestamp into the accelerated
 * calendar without assigning an arbitrary borrower or changing loan terms.
 * Old app loans commonly placed the first payment only one settlement-hour
 * after origination. Treat a still-future sub-day first payment as one full
 * game-month, so upgrading an existing save does not immediately surprise-charge
 * the player. Longer real-calendar intervals convert day-for-game-day, capped
 * at one game-month. Already-due legacy payments are due next settlement.
 */
export function migrateLegacyLoanDueDay(
  nextDueAt: unknown,
  nowMs: number,
  currentCompletedSettlements: number,
): number {
  const current = safeGameDayCounter(currentCompletedSettlements);
  const due = Number(nextDueAt);
  if (!Number.isFinite(due) || due <= nowMs) return current;
  const remainingMs = due - nowMs;
  if (remainingMs < 24 * REAL_MS_PER_SETTLEMENT)
    return current + GAME_DAYS_PER_MONTH;
  const remainingRealDays = Math.ceil(remainingMs / (24 * REAL_MS_PER_SETTLEMENT));
  return current + Math.min(GAME_DAYS_PER_MONTH, Math.max(1, remainingRealDays));
}
