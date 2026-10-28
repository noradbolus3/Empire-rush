import assert from "node:assert/strict";
import { DEFAULT_BUSINESSES } from "../src/engine/businessSimulation";
import {
  buildCanonicalBusinessRegistry,
} from "../src/engine/canonicalBusinessRegistry";
import { settleHour, type FinancialGameState } from "../src/engine/financialCore";

const business = {
  ...DEFAULT_BUSINESSES[0],
  isAcquired: true,
  hourlyNetProfit: 125,
  pendingSettlementAmount: 50,
};

const businesses = DEFAULT_BUSINESSES.map((item, index) =>
  index === 0 ? business : item,
);

const state: FinancialGameState = {
  cash: 0,
  bank: {
    savingsBalance: 0,
    businessCheckingBalance: 0,
    deposits: [],
    loans: [],
    insurance: [],
    investors: [],
    savingsRateBoostUntil: 0,
    taxRecords: [],
    marketEvents: [],
  },
  assets: [],
  holdings: {},
  owned: [],
  lifestyleAssets: [],
  businesses,
  businessRegistry: buildCanonicalBusinessRegistry({ businesses }),
  systemTimeMs: 1_000_000,
  multiplier: 1,
};

// This is intentionally the same state propagation shape as App.tsx's
// offline settlement loop: settleHour returns state, then App advances cash
// and time while carrying the returned state into the next hour.
let cursor = state;
let totalDelta = 0;
const hourlyRevenue: number[] = [];

for (let hour = 0; hour < 2; hour += 1) {
  const result = settleHour(cursor);
  hourlyRevenue.push(result.breakdown.businessRevenue);
  totalDelta += result.cashDelta;
  cursor = {
    ...cursor,
    ...result.state,
    bank: { ...cursor.bank, ...result.state.bank },
    cash: Math.max(0, cursor.cash + result.cashDelta),
    systemTimeMs: cursor.systemTimeMs + 3_600_000,
  };
}

assert.deepEqual(hourlyRevenue, [50, 125]);
assert.equal(totalDelta, 175);
assert.equal(cursor.businesses[0]?.pendingSettlementAmount, 0);

console.log(
  JSON.stringify(
    {
      ok: true,
      hourlyRevenue,
      totalDelta,
      pendingAfterTwoHours: cursor.businesses[0]?.pendingSettlementAmount ?? 0,
    },
    null,
    2,
  ),
);
