import assert from "node:assert/strict";
import { DEFAULT_BUSINESSES } from "../src/engine/businessSimulation";
import {
  buildCanonicalBusinessRegistry,
  canonicalSettlementRevenue,
} from "../src/engine/canonicalBusinessRegistry";
import { settleHour, type FinancialGameState } from "../src/engine/financialCore";
import { DEFAULT_CONSTRUCTION_COMPANY } from "../src/types/construction";
import { DEFAULT_SOFTWARE_COMPANY } from "../src/types/software";
import { defaultBankState } from "../src/types/bank";

const generic = {
  ...DEFAULT_BUSINESSES[0],
  id: "phase3-generic-retail",
  name: "Phase 3 Retail",
  isAcquired: true,
  hourlyNetProfit: 125,
  pendingSettlementAmount: 50,
};

const construction = {
  ...DEFAULT_CONSTRUCTION_COMPANY,
  status: "operating" as const,
  landParcels: 1,
  activeProjects: 1,
  workers: 50,
  contractValue: 2000,
  cashInvested: 100000,
};

const software = {
  ...DEFAULT_SOFTWARE_COMPANY,
  status: "operating" as const,
  developers: 2,
  designers: 1,
  activeProjects: 2,
  clientContracts: 1,
  cloudSpend: 100,
  offices: 1,
  cashInvested: 200000,
};

let state: FinancialGameState = {
  cash: 1000,
  bank: defaultBankState(),
  assets: [],
  holdings: {},
  owned: [],
  lifestyleAssets: [],
  businesses: [generic],
  businessSources: {
    constructionCompany: construction,
    softwareCompany: software,
  },
  businessRegistry: buildCanonicalBusinessRegistry({
    businesses: [generic],
    constructionCompany: construction,
    softwareCompany: software,
  }),
  systemTimeMs: 1_700_000_000_000,
};

const startingCash = state.cash;
const allEntries = [] as ReturnType<typeof settleHour>["ledger"];
const ticks: Array<Record<string, unknown>> = [];

for (let hour = 0; hour < 3; hour += 1) {
  const expectedRevenue = canonicalSettlementRevenue(state.businessRegistry || []);
  const result = settleHour(state);

  assert.equal(result.breakdown.businessRevenue, expectedRevenue);
  assert.equal(
    result.ledger.filter((entry) => entry.kind === "BUSINESS_REVENUE").length,
    1,
  );
  assert.equal(new Set(result.ledger.map((entry) => entry.id)).size, result.ledger.length);

  allEntries.push(...result.ledger);
  const nextCash = state.cash + result.cashDelta;
  assert.equal(nextCash, state.cash + result.cashDelta);
  state = {
    ...state,
    ...result.state,
    bank: { ...state.bank, ...result.state.bank },
    cash: nextCash,
    systemTimeMs: state.systemTimeMs + 3_600_000,
  };

  ticks.push({
    hour: hour + 1,
    businessRevenue: result.breakdown.businessRevenue,
    cashDelta: result.cashDelta,
    cashAfter: state.cash,
    genericPending: state.businesses[0]?.pendingSettlementAmount ?? 0,
    constructionActiveProjects: state.businessSources?.constructionCompany?.activeProjects,
    constructionCompletedProjects: state.businessSources?.constructionCompany?.completedProjects,
    softwareActiveProjects: state.businessSources?.softwareCompany?.activeProjects,
    softwareDeliveredProjects: state.businessSources?.softwareCompany?.deliveredProjects,
    ledgerEntries: result.ledger.length,
  });
}

const cashLedgerEntries = allEntries.filter((entry) => entry.kind !== "TAX");
assert.equal(
  state.cash,
  startingCash + cashLedgerEntries.reduce((sum, entry) => sum + entry.amount, 0),
);
assert.equal(state.businesses[0]?.pendingSettlementAmount, 0);
assert.equal(state.businessSources?.constructionCompany?.completedProjects, 1);
assert.equal(state.businessSources?.constructionCompany?.activeProjects, 0);
assert.equal(state.businessSources?.softwareCompany?.deliveredProjects, 2);
assert.equal(state.businessSources?.softwareCompany?.activeProjects, 0);
assert.equal(allEntries.length, 21);
assert.equal(new Set(allEntries.map((entry) => entry.id)).size, allEntries.length);

const reloaded = JSON.parse(JSON.stringify(state)) as FinancialGameState;
assert.equal(reloaded.cash, state.cash);
assert.deepEqual(reloaded.businesses, state.businesses);
assert.deepEqual(reloaded.businessSources, state.businessSources);
assert.deepEqual(reloaded.businessRegistry, state.businessRegistry);
assert.deepEqual(reloaded.bank, state.bank);
assert.equal(reloaded.systemTimeMs, state.systemTimeMs);

const noSourcesResult = settleHour({ ...state, businessSources: undefined });
assert.ok(noSourcesResult.state);
assert.ok(noSourcesResult.ledger.length >= 7);

console.log(
  JSON.stringify(
    {
      status: "PASS",
      ticks,
      startingCash,
      endingCash: state.cash,
      totalLedgerEntries: allEntries.length,
      uniqueLedgerEntries: new Set(allEntries.map((entry) => entry.id)).size,
      jsonRoundTrip: "PASS",
      missingSourcesFallback: "PASS",
      ipoAndBankDuplicateSubmission: "NOT_INCLUDED — covered by dedicated regressions",
      actualMountedReactNativePersistence: "NOT_TESTED",
    },
    null,
    2,
  ),
);
console.log("PHASE3_PRODUCTION_INTEGRATION_REGRESSION: PASS");
