import assert from "node:assert/strict";
import { DEFAULT_BUSINESSES, migrateBusinessSave } from "../src/engine/businessSimulation";
import { settleHour } from "../src/engine/financialCore";
import {
  daysUntilNextGameTaxDue,
  dueGameTaxQuarterKey,
  gameQuarterKey,
} from "../src/engine/gameCalendar";
import { calculateQuarterlyTaxEstimate, calculateTax, sanitizeBankState } from "../src/engine/bankEngine";
import { buildCanonicalBusinessRegistry } from "../src/engine/canonicalBusinessRegistry";
import { DEFAULT_TAXI_COMPANY, taxiHourlyEconomics, taxiSettlementTick } from "../src/types/taxi";
import { defaultBankState } from "../src/types/bank";

const legacyBank = sanitizeBankState({
  ...defaultBankState(),
  taxRecords: [
    { id: "legacy-paid-tax", year: 2026, income: 1000, deductions: 0, federal: 5, state: 2, payroll: 0, capitalGains: 0, paid: 7, dueAt: 0, status: "PAID" },
    { id: "legacy-zero-tax", year: 2026, income: 0, deductions: 0, federal: 0, state: 0, payroll: 0, capitalGains: 0, paid: 0, dueAt: 0, status: "PAID" },
  ],
}, 1_800_000_000_000);
assert.equal(legacyBank.taxRecords[0]?.periodKey, "Y1-Q1", "paid legacy estimate is not charged again in the first game quarter");
assert.equal(legacyBank.taxRecords[1]?.periodKey, undefined, "zero-dollar legacy payment does not suppress a real tax bill");

const savedBusinesses = DEFAULT_BUSINESSES.map((business) =>
  business.id === "apex-retail"
    ? { ...business, isAcquired: true, stockUnits: 120, lastSaleRevenue: 90 }
    : business,
);
const migratedBusinesses = migrateBusinessSave({ schemaVersion: 4, businesses: savedBusinesses });
const restoredRetail = migratedBusinesses.find((business) => business.id === "apex-retail");
assert.equal(restoredRetail?.isAcquired, true, "acquired supermarket survives migration");
assert.equal(restoredRetail?.stockUnits, 120, "inventory survives migration");
assert.equal(migratedBusinesses.some((business) => business.sector === "Banking"), true, "known Banking sector is accepted");
const salvaged = migrateBusinessSave([
  ...savedBusinesses,
  { id: "bad-row", name: "Bad", sector: 17, isAcquired: true },
] as never);
assert.equal(salvaged.find((business) => business.id === "apex-retail")?.isAcquired, true, "one malformed row cannot reset other acquired companies");

const taxi = {
  ...DEFAULT_TAXI_COMPANY,
  status: "operating" as const,
  area: "Airport Corridor" as const,
  economyTaxis: 4,
  drivers: 4,
  cashInvested: 52_000,
};
const taxiEconomics = taxiHourlyEconomics(taxi);
assert.equal(taxiEconomics.rides, 28, "four staffed economy taxis dispatch seven rides each");
const centralRevenue = taxiHourlyEconomics({ ...taxi, area: "Central City" }).revenue;
assert.ok(taxiEconomics.revenue > centralRevenue, "airport corridor applies a fare premium");
const tickedTaxi = taxiSettlementTick(taxi, 1_800_003_600_000);
assert.equal(tickedTaxi.completedRides, 28, "automatic settlement records rides without manual action");
assert.ok(tickedTaxi.lastShiftRevenue > tickedTaxi.lastShiftExpenses, "completed dispatch records its net result");

const registry = buildCanonicalBusinessRegistry({ businesses: migratedBusinesses, taxiCompany: taxi });
const settled = settleHour({
  cash: 100_000,
  bank: defaultBankState(),
  assets: [],
  holdings: {},
  owned: [],
  lifestyleAssets: [],
  businesses: migratedBusinesses,
  taxiCompany: taxi,
  businessSources: { taxiCompany: taxi },
  businessRegistry: registry,
  gameDayCounter: 0,
  systemTimeMs: 1_800_000_000_000,
});
assert.ok(settled.cashDelta > 0, "taxi operating net is credited by the central settlement");
assert.equal(settled.state.businessSources?.taxiCompany?.completedRides, 28, "central settlement automatically completes taxi rides");
assert.equal(settled.state.businesses.find((business) => business.id === "apex-retail")?.isAcquired, true, "settling Mobility preserves supermarket ownership");

const quarterly = calculateQuarterlyTaxEstimate(500);
const annual = calculateTax(500 * 360, 0, 0, 500 * 360 * 0.2);
assert.ok(quarterly.federal > 0 && quarterly.state > 0 && quarterly.payroll > 0, "positive run rate produces readable federal, state and payroll estimates");
assert.ok(Math.abs(quarterly.federal * 4 - annual.federal) < 0.05, "quarterly federal estimate is one-fourth of 360-day annual estimate");
assert.equal(dueGameTaxQuarterKey(89), null, "first quarterly payment is not due before day 90");
assert.equal(dueGameTaxQuarterKey(90), gameQuarterKey(0), "first payment is due after 90 completed game-days");
assert.equal(dueGameTaxQuarterKey(100), gameQuarterKey(0), "unpaid Q1 remains due after the boundary");
assert.equal(dueGameTaxQuarterKey(180), gameQuarterKey(90), "second payment becomes due after 180 completed game-days");
assert.equal(daysUntilNextGameTaxDue(89), 1, "one game-day remains at counter 89");
assert.equal(daysUntilNextGameTaxDue(90), 90, "next due date is a full game quarter after the boundary");

console.log(JSON.stringify({
  status: "PASS",
  cases: [
    "Banking-sector save migration preserves acquired supermarket and inventory",
    "Malformed business row does not reset valid ownership",
    "Airport Taxi dispatch earns premium fares and automatically records rides",
    "Central settlement credits taxi operating income and updates rides",
    "Tax estimate annualizes over 360 game-days and is payable every 90 days",
  ],
  taxi: { rides: taxiEconomics.rides, airportRevenue: taxiEconomics.revenue, centralRevenue },
  quarterlyTax: { federal: quarterly.federal, state: quarterly.state, payroll: quarterly.payroll },
}, null, 2));
