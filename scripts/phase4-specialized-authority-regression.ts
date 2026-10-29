import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DEFAULT_BUSINESSES } from "../src/engine/businessSimulation";
import {
  buildCanonicalBusinessRegistry,
  canonicalSettlementRevenue,
} from "../src/engine/canonicalBusinessRegistry";
import { settleHour, type FinancialGameState } from "../src/engine/financialCore";
import { DEFAULT_CONSTRUCTION_COMPANY, constructionTick } from "../src/types/construction";
import { DEFAULT_SOFTWARE_COMPANY, softwareSettlementTick } from "../src/types/software";
import { defaultBankState } from "../src/types/bank";

const businessScreen = readFileSync("src/screens/BusinessScreen.tsx", "utf8");
assert.match(
  businessScreen,
  /selected\?\.sector === "Construction_Mega"[\s\S]*company=\{constructionCompany\}[\s\S]*onChange=\{setConstructionCompany/,
  "selected Construction route must use specialized state and setter",
);
assert.match(
  businessScreen,
  /selected\?\.sector === "Tech_SaaS"[\s\S]*company=\{softwareCompany\}[\s\S]*onChange=\{setSoftwareCompany/,
  "selected Software route must use specialized state and setter",
);

const retail = {
  ...DEFAULT_BUSINESSES.find((item) => item.sector === "Retail")!,
  id: "phase4-retail",
  isAcquired: true,
  hourlyNetProfit: 125,
  pendingSettlementAmount: 50,
};
const genericConstruction = {
  ...DEFAULT_BUSINESSES.find((item) => item.sector === "Construction_Mega")!,
  id: "phase4-generic-construction-shadow",
  isAcquired: true,
  hourlyNetProfit: 999_999,
};
const genericSoftware = {
  ...DEFAULT_BUSINESSES.find((item) => item.sector === "Tech_SaaS")!,
  id: "phase4-generic-software-shadow",
  isAcquired: true,
  hourlyNetProfit: 999_999,
};

const construction = {
  ...DEFAULT_CONSTRUCTION_COMPANY,
  status: "operating" as const,
  landParcels: 2,
  activeProjects: 1,
  workers: 50,
  contractValue: 2_000,
  cashInvested: 100_000,
};
const software = {
  ...DEFAULT_SOFTWARE_COMPANY,
  status: "operating" as const,
  developers: 2,
  activeProjects: 2,
  clientContracts: 1,
  cloudSpend: 100,
  offices: 1,
  cashInvested: 200_000,
};

// These are the same production state transitions used by the specialized screens' settlement engines.
const constructionAfterUiAction = constructionTick({
  ...construction,
  activeProjects: 1,
  workers: 60,
}).company;
const softwareAfterUiAction = softwareSettlementTick({
  ...software,
  clientContracts: 2,
}).company;
assert.equal(constructionAfterUiAction.completedProjects, 1);
assert.equal(softwareAfterUiAction.deliveredProjects, 1);

let state: FinancialGameState = {
  cash: 1_000,
  bank: defaultBankState(),
  assets: [],
  holdings: {},
  owned: [],
  lifestyleAssets: [],
  businesses: [retail, genericConstruction, genericSoftware],
  businessSources: {
    constructionCompany: constructionAfterUiAction,
    softwareCompany: softwareAfterUiAction,
  },
  businessRegistry: buildCanonicalBusinessRegistry({
    businesses: [retail, genericConstruction, genericSoftware],
    constructionCompany: constructionAfterUiAction,
    softwareCompany: softwareAfterUiAction,
  }),
  systemTimeMs: 1_700_000_000_000,
};

assert.equal(
  state.businessRegistry.filter((item) => item.source === "generic-state").length,
  1,
  "generic retail remains while specialized Construction/Software shadows are removed",
);
assert.equal(
  state.businessRegistry.filter((item) => item.kind === "construction").length,
  1,
);
assert.equal(
  state.businessRegistry.filter((item) => item.kind === "software").length,
  1,
);
assert.ok(!state.businessRegistry.some((item) => item.hourlyNet === 999_999));

const startingCash = state.cash;
const ledger: Array<{ id: string; amount: number }> = [];
for (let hour = 0; hour < 3; hour += 1) {
  const expectedRevenue = canonicalSettlementRevenue(state.businessRegistry);
  const result = settleHour(state);
  assert.equal(result.breakdown.businessRevenue, expectedRevenue);
  assert.equal(result.ledger.filter((entry) => entry.kind === "BUSINESS_REVENUE").length, 1);
  assert.equal(new Set(result.ledger.map((entry) => entry.id)).size, result.ledger.length);
  ledger.push(...result.ledger.map((entry) => ({ id: entry.id, amount: entry.amount })));
  state = {
    ...state,
    ...result.state,
    bank: { ...state.bank, ...result.state.bank },
    cash: state.cash + result.cashDelta,
    systemTimeMs: state.systemTimeMs + 3_600_000,
  };
  state.businessRegistry = buildCanonicalBusinessRegistry({
    businesses: state.businesses,
    ...(state.businessSources || {}),
  });
}

assert.equal(state.businesses[0].pendingSettlementAmount, 0);
assert.equal(state.businessSources?.constructionCompany?.completedProjects, 1);
assert.equal(state.businessSources?.softwareCompany?.deliveredProjects, 2);
assert.equal(ledger.length, 21);
assert.equal(new Set(ledger.map((entry) => entry.id)).size, ledger.length);
assert.ok(state.cash > startingCash);

const reloaded = JSON.parse(JSON.stringify(state)) as FinancialGameState;
assert.deepEqual(reloaded.businesses, state.businesses);
assert.deepEqual(reloaded.businessSources, state.businessSources);
assert.deepEqual(reloaded.businessRegistry, state.businessRegistry);
assert.equal(reloaded.cash, state.cash);

console.log(JSON.stringify({
  status: "PASS",
  routeWiring: "PASS (source-backed route boundary; mounted RN route NOT_TESTED)",
  constructionUiActionProjection: {
    completedProjects: constructionAfterUiAction.completedProjects,
    authoritativeState: "constructionCompany",
  },
  softwareUiActionProjection: {
    deliveredProjects: softwareAfterUiAction.deliveredProjects,
    authoritativeState: "softwareCompany",
  },
  threeHourCash: { starting: startingCash, ending: state.cash },
  ledgerEntries: ledger.length,
  uniqueLedgerEntries: new Set(ledger.map((entry) => entry.id)).size,
  genericRetailPendingAfterSettlement: state.businesses[0].pendingSettlementAmount,
  jsonReload: "PASS",
  mountedReactNativeAndAsyncStorage: "NOT_TESTED",
}, null, 2));
console.log("PHASE4_SPECIALIZED_AUTHORITY_REGRESSION: PASS");
