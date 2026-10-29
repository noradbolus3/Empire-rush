import assert from "node:assert/strict";
import { DEFAULT_SOFTWARE_COMPANY, softwareSettlementTick } from "../src/types/software";
import { settleHour, type FinancialGameState } from "../src/engine/financialCore";
import { buildCanonicalBusinessRegistry } from "../src/engine/canonicalBusinessRegistry";

const now = 1_700_000_000_000;
const generic = {
  id: "generic-reconciliation-proof",
  name: "Proof Retail",
  sector: "Retail",
  isAcquired: true,
  acquisitionCost: 1_000,
  hourlyNetProfit: 125,
  baseHourlyRevenue: 125,
  pendingSettlementAmount: 50,
  stockUnits: 10,
  maxWarehouseCapacity: 100,
  unitWholesaleCost: 1,
  unitSellingPrice: 2,
  monthlyRent: 0,
  monthlyPayroll: 0,
} as any;
const software = {
  ...DEFAULT_SOFTWARE_COMPANY,
  id: "software-reconciliation-proof",
  name: "Proof Software",
  status: "operating" as const,
  activeProjects: 1,
  developers: 10,
  offices: 1,
  cashInvested: 100_000,
  deliveredProjects: 0,
};
const initial: FinancialGameState = {
  cash: 1_000_000,
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
  businesses: [generic],
  businessSources: { softwareCompany: software },
  systemTimeMs: now,
};

let cursor = initial;
const results = [] as ReturnType<typeof settleHour>[];
for (let hour = 0; hour < 2; hour += 1) {
  const result = settleHour(cursor);
  results.push(result);
  cursor = {
    ...cursor,
    ...result.state,
    cash: cursor.cash + result.cashDelta,
    systemTimeMs: cursor.systemTimeMs + 3_600_000,
  };
}

const sourceAfterTwoHours = cursor.businessSources?.softwareCompany;
const expectedSoftwareAfterOneHour = softwareSettlementTick(software).company;
const genericAfterTwoHours = cursor.businesses[0];
const persisted = JSON.parse(JSON.stringify(cursor)) as FinancialGameState;

console.log(JSON.stringify({
  hourlyBusinessRevenue: results.map((item) => item.breakdown.businessRevenue),
  totalCashDelta: results.reduce((sum, item) => sum + item.cashDelta, 0),
  genericPendingAfterTwoHours: genericAfterTwoHours.pendingSettlementAmount,
  softwareDeliveredProjectsBefore: software.deliveredProjects,
  softwareDeliveredProjectsExpectedAfterOneHour: expectedSoftwareAfterOneHour.deliveredProjects,
  softwareDeliveredProjectsAfterTwoHours: sourceAfterTwoHours?.deliveredProjects,
  persistedSoftwareDeliveredProjects: persisted.businessSources?.softwareCompany?.deliveredProjects,
}));

assert.equal(results[0].breakdown.businessRevenue, 50 + buildCanonicalBusinessRegistry({ businesses: [generic], softwareCompany: software }).find((item) => item.kind === "software")!.hourlyNet);
assert.equal(results[1].breakdown.businessRevenue, 125);
assert.equal(genericAfterTwoHours.pendingSettlementAmount, 0);
// This assertion is intentionally red before the production fix: the old App-style
// loop carries the stale specialized source because settleHour has no source write-back.
assert.equal(sourceAfterTwoHours?.deliveredProjects, expectedSoftwareAfterOneHour.deliveredProjects);
assert.equal(persisted.businessSources?.softwareCompany?.deliveredProjects, expectedSoftwareAfterOneHour.deliveredProjects);
console.log("SPECIALIZED_SETTLEMENT_RECONCILIATION_REGRESSION: PASS");
