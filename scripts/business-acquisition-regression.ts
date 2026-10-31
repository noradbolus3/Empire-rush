import assert from "node:assert/strict";
import { BUSINESS_DISPLAY_CATALOG } from "../src/data/businessDisplayCatalog";
import {
  commitBusinessAcquisition,
} from "../src/engine/businessAcquisition";
import {
  buildCanonicalBusinessRegistry,
} from "../src/engine/canonicalBusinessRegistry";
import {
  buildUnifiedBusinessPortfolio,
  portfolioStatus,
} from "../src/engine/businessPortfolio";
import {
  BUSINESS_ROUTE_BACK_HANDLERS,
  BUSINESS_ROUTE_CATALOG,
  getBusinessRouteForEntity,
} from "../src/screens/business/businessRouteCatalog";
import { DEFAULT_BUSINESSES } from "../src/engine/businessSimulation";

const acquisitionRoutes = BUSINESS_ROUTE_CATALOG.filter((route) => route.kind !== "generic");
const ledger: { id: string; amount: number }[] = [];
const owned = new Set<string>();
let cash = 20_000_000;
const startingCash = cash;
const onCashChange = (update: (value: number) => number) => {
  cash = update(cash);
};
const acquire = (id: string, name: string, amount: number, now: number) =>
  commitBusinessAcquisition({
    key: id,
    businessId: id,
    businessName: name,
    amount,
    detail: "Phase 5 acquisition fixture",
    cash,
    onCashChange,
    onLedger: (entry) => ledger.push({ id: entry.id, amount: entry.amount }),
    onCommit: () => owned.add(id),
    now,
  });

for (const route of acquisitionRoutes) {
  const id = route.stableIds[0] ?? `${route.kind}-fixture`;
  const amount = BUSINESS_DISPLAY_CATALOG.find((entry) => entry.kind === route.kind)?.charterCost ?? 1;
  const result = acquire(id, route.label, amount, 1_000 + ledger.length);
  assert.equal(result.accepted, true, `${route.kind} acquisition should commit once`);
  assert.equal(owned.has(id), true, `${route.kind} ownership should commit after cash/ledger`);
}
assert.equal(ledger.length, acquisitionRoutes.length, "one ledger entry per specialized acquisition");
assert.equal(cash, startingCash - ledger.reduce((sum, entry) => sum - entry.amount, 0), "cash reconciles to acquisition ledger");

const duplicateId = "duplicate-acquisition-fixture";
const duplicateFirst = acquire(duplicateId, "Duplicate Fixture", 500, 50_000);
const duplicateSecond = acquire(duplicateId, "Duplicate Fixture", 500, 50_001);
assert.equal(duplicateFirst.accepted, true, "first duplicate fixture submission should commit");
assert.equal(duplicateSecond.accepted, false, "second rapid submission should be rejected");
assert.equal(ledger.filter((entry) => entry.id === `ledger-business-acquisition-${duplicateId}`).length, 1);
assert.equal(owned.has(duplicateId), true);

const insufficientId = "insufficient-acquisition-fixture";
let insufficientCash = 99;
let insufficientCommits = 0;
const insufficientLedger: unknown[] = [];
const insufficient = commitBusinessAcquisition({
  key: insufficientId,
  businessId: insufficientId,
  businessName: "Insufficient Fixture",
  amount: 100,
  detail: "insufficient funds",
  cash: insufficientCash,
  onCashChange: (update) => { insufficientCash = update(insufficientCash); },
  onLedger: (entry) => insufficientLedger.push(entry),
  onCommit: () => { insufficientCommits += 1; },
  now: 60_000,
});
assert.equal(insufficient.accepted, false);
assert.equal(insufficient.reason, "insufficient-funds");
assert.equal(insufficientCash, 99);
assert.equal(insufficientCommits, 0);
assert.equal(insufficientLedger.length, 0);

const retry = commitBusinessAcquisition({
  key: insufficientId,
  businessId: insufficientId,
  businessName: "Insufficient Fixture",
  amount: 100,
  detail: "retry after valid funding",
  cash: 200,
  onCashChange: () => undefined,
  onLedger: () => undefined,
  onCommit: () => undefined,
  now: 60_001,
});
assert.equal(retry.accepted, true, "a rejected attempt must not permanently lock the action");

const legacyOwned = DEFAULT_BUSINESSES.map((business) =>
  business.id === "cyberpulse-saas" ? { ...business, isAcquired: true } : business,
);
const legacyRegistry = buildCanonicalBusinessRegistry({ businesses: legacyOwned });
const legacyPortfolio = buildUnifiedBusinessPortfolio(legacyRegistry, legacyOwned);
const software = legacyPortfolio.find((row) => row.kind === "software")!;
assert.equal(portfolioStatus(software, legacyOwned, 0), "owned", "legacy acquired IT shadow remains owned");
assert.equal(legacyPortfolio.filter((row) => row.kind === "software").length, 1);

for (const route of BUSINESS_ROUTE_CATALOG) {
  assert.ok(BUSINESS_ROUTE_BACK_HANDLERS[route.screen], `${route.kind} needs a back-to-portfolio handler`);
}
assert.equal(getBusinessRouteForEntity({ id: "blueharbor-banking", sector: "Banking" }).kind, "generic");
assert.equal(BUSINESS_ROUTE_CATALOG.find((route) => route.kind === "generic")?.stateKey, "businesses");

const reloaded = JSON.parse(JSON.stringify({ cash, owned: [...owned], ledger }));
assert.equal(reloaded.cash, cash);
assert.deepEqual(reloaded.owned, [...owned]);
assert.deepEqual(reloaded.ledger, ledger);

console.log(JSON.stringify({
  status: "PASS",
  specializedAcquisitions: acquisitionRoutes.length,
  successfulLedgerEntries: ledger.length,
  duplicateAccepted: [duplicateFirst.accepted, duplicateSecond.accepted],
  duplicateLedgerEntries: ledger.filter((entry) => entry.id === `ledger-business-acquisition-${duplicateId}`).length,
  insufficientState: { cash: insufficientCash, commits: insufficientCommits, ledgerEntries: insufficientLedger.length },
  legacySoftwareStatus: portfolioStatus(software, legacyOwned, 0),
  routeBackHandlers: BUSINESS_ROUTE_CATALOG.length,
  bankingCompanyRoute: getBusinessRouteForEntity({ id: "blueharbor-banking", sector: "Banking" }).kind,
  reloadOwnedCount: reloaded.owned.length,
}, null, 2));
