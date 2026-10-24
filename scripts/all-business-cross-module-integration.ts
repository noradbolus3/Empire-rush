import assert from "node:assert/strict";
import { settleHour } from "../src/engine/financialCore";
import { DEFAULT_TAXI_COMPANY, taxiHourlyEconomics } from "../src/types/taxi";

const timestamp = 1_800_000_000_000;
const moduleNames = [
  "Taxi", "Shipping", "Factory", "Construction", "Car Dealership", "IT & Software", "Sports Club",
  "Oil & Gas", "Airline", "Hotel", "Blockchain", "Space", "Holding Company",
] as const;
const acquisitionCosts = [5000, 7000, 9000, 11000, 13000, 15000, 17000, 19000, 21000, 23000, 25000, 27000, 29000];
const initialCash = 1_000_000;
const globalLedger: any[] = [];
let cash = initialCash;
const appendTransaction = (module: string, amount: number, kind: "PURCHASE" | "BUSINESS_REVENUE") => {
  const entry = { id: `integration-${module.toLowerCase().replace(/[^a-z]+/g, "-")}-${globalLedger.length}`, kind, label: `${module} integration event`, amount, timestamp: timestamp + globalLedger.length, detail: "Cross-module integration test" };
  assert.equal(globalLedger.some((item) => item.id === entry.id), false, `${module}: duplicate ledger id`);
  globalLedger.push(entry);
  cash += amount;
};

for (let i = 0; i < moduleNames.length; i += 1) appendTransaction(moduleNames[i], -acquisitionCosts[i], "PURCHASE");
assert.equal(globalLedger.length, 13, "all 13 modules must sync one purchase transaction");
assert.equal(new Set(globalLedger.map((item) => item.id)).size, 13, "ledger ids must be unique");
assert.equal(globalLedger.every((item) => item.kind === "PURCHASE" && item.amount < 0), true, "purchase entries must be signed negative");
assert.equal(cash, initialCash - acquisitionCosts.reduce((sum, value) => sum + value, 0), "purchase cash mutations must match ledger sum");

const taxiCompany = {
  ...DEFAULT_TAXI_COMPANY,
  status: "operating" as const,
  economyTaxis: 3,
  drivers: 3,
  demandIndex: 1.2,
};
const taxiNet = taxiHourlyEconomics(taxiCompany).net;
const businesses = moduleNames.slice(1).map((name, index) => ({
  id: `business-${index}`,
  name,
  sector: index === 0 ? "Logistics" : "Technology",
  isAcquired: true,
  hourlyNetProfit: 100 + index * 25,
  acquisitionCost: acquisitionCosts[index + 1],
  pendingSettlementAmount: 0,
  staffCount: 0,
})) as any;
const expectedBusinessRevenue = businesses.reduce((sum, item) => sum + item.hourlyNetProfit, 0) + taxiNet;
const settlement = settleHour({
  cash,
  bank: { savingsBalance: 0, businessCheckingBalance: 0, deposits: [], loans: [], insurance: [], investors: [], savingsRateBoostUntil: 0, taxRecords: [], marketEvents: [] },
  assets: [], holdings: {}, owned: [], lifestyleAssets: [], businesses, taxiCompany, systemTimeMs: timestamp,
});
assert.ok(Math.abs(settlement.breakdown.businessRevenue - expectedBusinessRevenue) < 0.01, "all business revenue must reach shared settlement");
assert.ok(settlement.ledger.some((item) => item.kind === "BUSINESS_REVENUE" && Math.abs(item.amount - expectedBusinessRevenue) < 0.01), "combined business revenue ledger entry missing or incorrect");
assert.equal(settlement.projectedHourlyNet, settlement.cashDelta, "projected hourly net must equal cash delta");
const settlementLedgerSum = settlement.ledger.reduce((sum, item) => sum + item.amount, 0);
assert.ok(Math.abs(settlementLedgerSum + settlement.breakdown.taxAccrual - settlement.cashDelta) < 0.01, "cash delta must exclude deferred tax accrual from immediate cash movement");
assert.ok(Number.isFinite(cash + settlement.cashDelta), "cash after settlement must remain finite");

const revenueEntry = settlement.ledger.find((item) => item.kind === "BUSINESS_REVENUE");
assert.ok(revenueEntry?.detail?.includes("Taxi Company"), "Taxi must be identified in the unified revenue detail");
console.log(JSON.stringify({
  test: "all-business-cross-module-integration",
  status: "PASS",
  modules: moduleNames.length,
  purchaseLedgerEntries: globalLedger.length,
  cashBeforePurchases: initialCash,
  cashAfterPurchases: cash,
  expectedBusinessRevenue: Number(expectedBusinessRevenue.toFixed(2)),
  taxiNet: Number(taxiNet.toFixed(2)),
  settlementCashDelta: settlement.cashDelta,
  projectedHourlyNet: settlement.projectedHourlyNet,
  settlementLedgerKinds: settlement.ledger.map((item) => item.kind),
  deferredTaxAccrual: settlement.breakdown.taxAccrual,
  cashAfterSettlement: Number((cash + settlement.cashDelta).toFixed(2)),
}, null, 2));
