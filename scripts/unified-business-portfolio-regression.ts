import assert from "node:assert/strict";
import { DEFAULT_BUSINESSES } from "../src/engine/businessSimulation";
import {
  buildCanonicalBusinessRegistry,
  canonicalActiveCount,
} from "../src/engine/canonicalBusinessRegistry";
import {
  buildUnifiedBusinessPortfolio,
  portfolioStatus,
} from "../src/engine/businessPortfolio";
import { BUSINESS_ROUTE_CATALOG, getBusinessRouteForEntity } from "../src/screens/business/businessRouteCatalog";
import { DEFAULT_TAXI_COMPANY } from "../src/types/taxi";

const registry = buildCanonicalBusinessRegistry({
  businesses: DEFAULT_BUSINESSES,
});
const rows = buildUnifiedBusinessPortfolio(registry, DEFAULT_BUSINESSES);
const specializedRoutes = BUSINESS_ROUTE_CATALOG.filter((entry) => entry.kind !== "generic");

assert.equal(
  specializedRoutes.every((route) => rows.filter((row) => row.kind === route.kind).length === 1),
  true,
  "every specialized route must appear exactly once",
);
assert.equal(
  rows.filter((row) => row.id === "cyberpulse-saas").length,
  1,
  "IT shadow ID must resolve to one portfolio card, not a duplicate",
);
assert.equal(
  rows.filter((row) => row.id === "titan-infrastructure").length,
  1,
  "Construction shadow ID must resolve to one portfolio card, not a duplicate",
);
assert.equal(
  rows.find((row) => row.id === "cyberpulse-saas")?.source,
  "specialized-state",
  "IT shadow must be represented by specialized route authority",
);
assert.equal(
  rows.find((row) => row.id === "titan-infrastructure")?.source,
  "specialized-state",
  "Construction shadow must be represented by specialized route authority",
);
assert.equal(
  new Set(rows.map((row) => row.id)).size,
  rows.length,
  "portfolio row IDs must be unique",
);
assert.equal(
  portfolioStatus(registry.find((row) => row.id === "apex-retail")!, DEFAULT_BUSINESSES, 0),
  "available",
  "unlocked generic business must be available",
);
assert.equal(
  portfolioStatus(registry.find((row) => row.id === "metro-mobility")!, DEFAULT_BUSINESSES, 0),
  "locked",
  "locked generic business must remain locked",
);

const acquiredGeneric = DEFAULT_BUSINESSES.map((business) =>
  business.id === "apex-retail" ? { ...business, isAcquired: true } : business,
);
const acquiredRegistry = buildCanonicalBusinessRegistry({ businesses: acquiredGeneric });
const acquiredRows = buildUnifiedBusinessPortfolio(acquiredRegistry, acquiredGeneric);
const acquiredRetail = acquiredRows.find((row) => row.id === "apex-retail")!;
assert.equal(portfolioStatus(acquiredRetail, acquiredGeneric, 0), "owned", "acquisition must update portfolio status");
assert.equal(canonicalActiveCount(acquiredRegistry), 1, "canonical active count must include the acquired generic company once");
assert.equal(getBusinessRouteForEntity({ id: "titan-infrastructure", sector: "Construction_Mega" }).kind, "construction");
assert.equal(getBusinessRouteForEntity({ id: "cyberpulse-saas", sector: "Tech_SaaS" }).kind, "software");

const taxiRegistry = buildCanonicalBusinessRegistry({
  businesses: DEFAULT_BUSINESSES,
  taxiCompany: { ...DEFAULT_TAXI_COMPANY, status: "operating", economyTaxis: 1, cashInvested: 12_000 },
});
const taxiRows = buildUnifiedBusinessPortfolio(taxiRegistry, DEFAULT_BUSINESSES);
assert.equal(taxiRows.filter((row) => row.kind === "taxi").length, 1, "owned specialized company must still appear once");
assert.equal(taxiRows.find((row) => row.kind === "taxi")?.owned, true, "specialized operating state must be owned");

console.log(JSON.stringify({
  status: "PASS",
  canonicalRecords: registry.length,
  portfolioRows: rows.length,
  specializedRouteCount: specializedRoutes.length,
  uniquePortfolioIds: new Set(rows.map((row) => row.id)).size,
  defaultStatuses: {
    retail: portfolioStatus(registry.find((row) => row.id === "apex-retail")!, DEFAULT_BUSINESSES, 0),
    mobility: portfolioStatus(registry.find((row) => row.id === "metro-mobility")!, DEFAULT_BUSINESSES, 0),
  },
  acquiredGenericStatus: portfolioStatus(acquiredRetail, acquiredGeneric, 0),
  taxiOwned: taxiRows.find((row) => row.kind === "taxi")?.owned,
}, null, 2));
