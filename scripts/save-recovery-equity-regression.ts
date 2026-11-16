import assert from "node:assert/strict";
import { DEFAULT_BUSINESSES, recoverBusinessSave, retailHourlyProjection } from "../src/engine/businessSimulation";
import { buildCanonicalBusinessRegistry } from "../src/engine/canonicalBusinessRegistry";
import { calculateInvestorShare } from "../src/engine/financialCore";

const market = {
  ...DEFAULT_BUSINESSES.find((item) => item.id === "apex-retail")!,
  isAcquired: true,
  stockUnits: 321,
};
const mobility = {
  ...DEFAULT_BUSINESSES.find((item) => item.id === "metro-mobility")!,
  isAcquired: true,
  fleetHealth: 83,
};
const savedPortfolio = JSON.stringify({ schemaVersion: 4, businesses: [market, mobility] });

const fromBackup = recoverBusinessSave("{bad primary", savedPortfolio, null);
assert.equal(fromBackup.source, "backup");
assert.equal(fromBackup.businesses.find((item) => item.id === "apex-retail")?.isAcquired, true);
assert.equal((fromBackup.businesses.find((item) => item.id === "apex-retail") as any)?.stockUnits, 321);
assert.equal(fromBackup.businesses.find((item) => item.id === "metro-mobility")?.isAcquired, true);

const fromRoot = recoverBusinessSave(null, null, JSON.stringify({ businesses: [market, mobility] }));
assert.equal(fromRoot.source, "root");
assert.equal(fromRoot.businesses.find((item) => item.id === "apex-retail")?.isAcquired, true);
assert.equal(fromRoot.businesses.find((item) => item.id === "metro-mobility")?.isAcquired, true);

const primaryWins = recoverBusinessSave(savedPortfolio, null, null);
assert.equal(primaryWins.source, "primary");
assert.equal(primaryWins.businesses.find((item) => item.id === "apex-retail")?.isAcquired, true);

const validButStaleDefaults = JSON.stringify({ schemaVersion: 4, businesses: DEFAULT_BUSINESSES });
const acquiredBackup = JSON.stringify({ schemaVersion: 4, businesses: [market, mobility] });
const stalePrimaryRecovered = recoverBusinessSave(
  validButStaleDefaults,
  acquiredBackup,
  JSON.stringify({ businesses: DEFAULT_BUSINESSES }),
);
assert.equal(stalePrimaryRecovered.source, "backup");
assert.equal(stalePrimaryRecovered.businesses.filter((item) => item.isAcquired).length, 2);

const newestAcquiredRoot = recoverBusinessSave(
  validButStaleDefaults,
  null,
  JSON.stringify({ saved: 500, businesses: [market, mobility] }),
);
assert.equal(newestAcquiredRoot.source, "root");
assert.equal(newestAcquiredRoot.businesses.find((item) => item.id === "apex-retail")?.isAcquired, true);

const retailOnlySave = DEFAULT_BUSINESSES.map((item) =>
  item.id === market.id ? market : item,
);
const mobilityOnlySave = DEFAULT_BUSINESSES.map((item) =>
  item.id === mobility.id ? mobility : item,
);
const complementaryLegacyCopies = recoverBusinessSave(
  JSON.stringify({ schemaVersion: 4, businesses: retailOnlySave }),
  JSON.stringify({ schemaVersion: 4, businesses: mobilityOnlySave }),
  JSON.stringify({ businesses: DEFAULT_BUSINESSES }),
);
assert.equal(complementaryLegacyCopies.businesses.find((item) => item.id === market.id)?.isAcquired, true);
assert.equal(complementaryLegacyCopies.businesses.find((item) => item.id === mobility.id)?.isAcquired, true);

const intentionalReset = recoverBusinessSave(
  JSON.stringify({ schemaVersion: 4, savedAt: 700, businesses: DEFAULT_BUSINESSES }),
  JSON.stringify({ schemaVersion: 4, savedAt: 600, businesses: [market, mobility] }),
  JSON.stringify({ saved: 650, businesses: [market, mobility] }),
);
assert.equal(intentionalReset.source, "primary");
assert.equal(intentionalReset.businesses.filter((item) => item.isAcquired).length, 0);

const earningMarket = {
  ...market,
  stockUnits: 321,
  pricingTier: "Standard" as const,
  hourlyNetProfit: 120,
  pendingSettlementAmount: 48,
};
const retailProjection = retailHourlyProjection(earningMarket);
assert.ok(retailProjection.revenue > retailProjection.net);
assert.ok(retailProjection.expenses > 0);
const marketRecord = buildCanonicalBusinessRegistry({ businesses: [earningMarket] })[0];
assert.ok(marketRecord.valuation > 0);
assert.ok(marketRecord.hourlyRevenue > marketRecord.hourlyNet);
assert.ok(marketRecord.hourlyExpenses > 0);
assert.equal(marketRecord.pendingSettlementAmount, 48);

const valid = (id: string, pendingSettlementAmount: number, hourlyNet: number) => ({
  id,
  name: id,
  kind: "generic" as const,
  owned: true,
  operating: true,
  hourlyRevenue: pendingSettlementAmount,
  hourlyExpenses: 0,
  hourlyNet,
  pendingSettlementAmount,
  assetValue: 1_000,
  investedCapital: 500,
  valuation: 2_000,
  consolidatesOtherBusinesses: false,
  source: "generic-state" as const,
});
const registry = [valid("market", 100, 90), valid("mobility", 500, 400)];
const equityState: any = {
  multiplier: 1,
  bank: {
    investors: [
      { id: "legacy", round: "ANGEL", equityPercent: 10 },
      { id: "market-angel", round: "ANGEL", equityPercent: 10, companyId: "market" },
      { id: "mobility-angel", round: "ANGEL", equityPercent: 5, companyId: "mobility" },
    ],
  },
};
assert.equal(calculateInvestorShare(equityState, 600, registry), 95);
const noCompanyRevenue = [valid("market", 0, 0), valid("mobility", 500, 400)];
assert.equal(calculateInvestorShare(equityState, 500, noCompanyRevenue), 75);

console.log(JSON.stringify({
  test: "save-recovery-equity-regression",
  checks: 24,
  passed: true,
  recoveredSources: [fromBackup.source, fromRoot.source, primaryWins.source, stalePrimaryRecovered.source, newestAcquiredRoot.source, intentionalReset.source],
  companySpecificDistribution: 95,
  pausedCompanyDistribution: 75,
}, null, 2));
