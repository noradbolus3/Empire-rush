import { BusinessEntity } from "../types/business";
import {
  SettlementCredit,
  SettlementRate,
  SettlementResult,
} from "../types/settlement";

export const SETTLEMENT_INTERVAL_SECONDS = 60 * 60;
export const SETTLEMENT_INTERVAL_MS = SETTLEMENT_INTERVAL_SECONDS * 1000;
export const MAX_SETTLEMENT_SECONDS = 24 * SETTLEMENT_INTERVAL_SECONDS;

export function businessSettlementRates(
  businesses: BusinessEntity[],
): SettlementRate[] {
  return businesses
    .filter((business) => business.isAcquired)
    .map((business) => ({
      businessId: business.id,
      source: business.name,
      hourlyRate: Number(Math.max(0, business.hourlyNetProfit).toFixed(2)),
    }))
    .filter((rate) => rate.hourlyRate > 0);
}

export function settleElapsedBusinessIncome(
  businesses: BusinessEntity[],
  lastSettlementAtMs: number,
  nowMs: number,
): SettlementResult {
  const safeLast = Number.isFinite(lastSettlementAtMs)
    ? lastSettlementAtMs
    : nowMs;
  const safeNow = Number.isFinite(nowMs) ? nowMs : safeLast;
  const elapsedSeconds = Math.min(
    MAX_SETTLEMENT_SECONDS,
    Math.max(0, (safeNow - safeLast) / 1000),
  );
  const completedHours = Math.floor(
    elapsedSeconds / SETTLEMENT_INTERVAL_SECONDS,
  );
  const nextSettlementAtMs = safeLast + completedHours * SETTLEMENT_INTERVAL_MS;
  const credits: SettlementCredit[] = [];
  const remaining: Record<string, { amount: number; seconds: number }> = {};
  for (const business of businesses.filter((item) => item.isAcquired)) {
    const accruedSeconds = Math.max(
      0,
      Number(business.settlementAccruedSeconds ?? 0),
    );
    const pendingAmount = Math.max(
      0,
      Number(business.pendingSettlementAmount ?? 0),
    );
    const onlineHours = Math.min(
      completedHours,
      Math.floor(accruedSeconds / SETTLEMENT_INTERVAL_SECONDS),
    );
    const onlineSecondsCredited = onlineHours * SETTLEMENT_INTERVAL_SECONDS;
    const accruedCredit =
      accruedSeconds > 0 && onlineSecondsCredited > 0
        ? pendingAmount * (onlineSecondsCredited / accruedSeconds)
        : 0;
    const offlineHours = Math.max(0, completedHours - onlineHours);
    const offlineCredit = Math.max(0, business.hourlyNetProfit) * offlineHours;
    const amount = Number((accruedCredit + offlineCredit).toFixed(2));
    const remainingSeconds = Math.max(
      0,
      accruedSeconds - onlineSecondsCredited,
    );
    const remainingAmount = Number(
      Math.max(0, pendingAmount - accruedCredit).toFixed(2),
    );
    remaining[business.id] = {
      amount: remainingAmount,
      seconds: remainingSeconds,
    };
    if (amount > 0)
      credits.push({
        businessId: business.id,
        source: business.name,
        hourlyRate: Number(Math.max(0, business.hourlyNetProfit).toFixed(2)),
        hours: completedHours,
        amount,
      });
  }
  return {
    elapsedSeconds,
    completedHours,
    nextSettlementAtMs,
    totalAmount: Number(
      credits.reduce((sum, credit) => sum + credit.amount, 0).toFixed(2),
    ),
    credits,
    remaining,
  };
}

export function settlementCountdownMs(
  lastSettlementAtMs: number,
  nowMs: number,
): number {
  const elapsed = Math.max(0, nowMs - lastSettlementAtMs);
  return Math.max(
    0,
    SETTLEMENT_INTERVAL_MS - (elapsed % SETTLEMENT_INTERVAL_MS),
  );
}

export function formatSettlementCountdown(milliseconds: number): string {
  const totalSeconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}h ${String(minutes).padStart(2, "0")}m`
    : `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}
