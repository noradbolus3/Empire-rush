import assert from "node:assert/strict";
import { selectHomePortfolioBusinesses } from "../src/engine/homePortfolio";
import type { CanonicalBusiness } from "../src/engine/canonicalBusinessRegistry";

const record = (overrides: Partial<CanonicalBusiness>): CanonicalBusiness => ({
  id: "generic-1",
  name: "Operating Company",
  kind: "generic",
  owned: false,
  operating: false,
  hourlyRevenue: 0,
  hourlyExpenses: 0,
  hourlyNet: 0,
  pendingSettlementAmount: 0,
  assetValue: 0,
  consolidatesOtherBusinesses: false,
  source: "generic-state",
  ...overrides,
});

const registry = [
  record({ id: "generic-1", owned: true, operating: true, hourlyNet: 125 }),
  record({ id: "empire-taxi-company", name: "My Taxi Company", kind: "taxi", owned: true, operating: true, source: "specialized-state", hourlyNet: 380 }),
  record({ id: "empire-software-company", name: "My Software Company", kind: "software", owned: true, operating: true, source: "specialized-state", hourlyNet: 900 }),
  record({ id: "locked-space", name: "Space Company", kind: "space" }),
];

const selected = selectHomePortfolioBusinesses(registry);
assert.deepEqual(selected.map((item) => item.id), [
  "generic-1",
  "empire-taxi-company",
  "empire-software-company",
]);
assert.equal(selected.length, 3);
assert.equal(selected.some((item) => item.id === "locked-space"), false);
assert.equal(new Set(selected.map((item) => item.id)).size, selected.length);

console.log(JSON.stringify({
  test: "home-canonical-portfolio-regression",
  canonicalRecords: registry.length,
  selectedOwnedRecords: selected.length,
  specializedOnlyRecordsIncluded: selected.filter((item) => item.source === "specialized-state").length,
  lockedRecordsExcluded: registry.length - selected.length,
  result: "PASS",
}, null, 2));
