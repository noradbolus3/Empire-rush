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

const spendLocks = new Map<string, number>();
const SPEND_LOCK_MS = 350;

/**
 * Reserves a named spend action for a short synchronous UI window.
 * React state updates are asynchronous; without this boundary two rapid taps
 * can both pass the same stale cash pre-check and create duplicate inventory.
 */
export function tryAcquireSpendLock(key: string, now = Date.now()): boolean {
  const lockedUntil = spendLocks.get(key) ?? 0;
  if (lockedUntil > now) return false;
  spendLocks.set(key, now + SPEND_LOCK_MS);
  return true;
}

export function clearSpendLock(key: string): void {
  spendLocks.delete(key);
}

export function resetSpendLocks(): void {
  spendLocks.clear();
}
