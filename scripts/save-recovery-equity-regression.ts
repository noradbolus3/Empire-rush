import assert from "node:assert/strict";
import { DEFAULT_BUSINESSES, recoverBusinessSave } from "../src/engine/businessSimulation";
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
  checks: 11,
  passed: true,
  recoveredSources: [fromBackup.source, fromRoot.source, primaryWins.source],
  companySpecificDistribution: 95,
  pausedCompanyDistribution: 75,
}, null, 2));
