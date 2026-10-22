export type CashUpdate = number | ((current: number) => number);

export function sanitizeCash(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Number(value)));
}

export function resolveCashUpdate(current: number, update: CashUpdate): number {
  const proposed = typeof update === "function" ? update(current) : update;
  return sanitizeCash(proposed);
}

export function canSpend(current: number, amount: number): boolean {
  return Number.isFinite(amount) && amount >= 0 && sanitizeCash(current) >= amount;
}

export function cashAfterSpend(current: number, amount: number): number {
  if (!canSpend(current, amount)) return sanitizeCash(current);
  return sanitizeCash(current - amount);
}
