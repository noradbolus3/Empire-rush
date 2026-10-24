import assert from 'node:assert/strict';
import { settleHour } from '../src/engine/financialCore';
import { taxiHourlyEconomics, type TaxiCompanyState } from '../src/types/taxi';

const taxi: TaxiCompanyState = {
  id: 'empire-taxi-company',
  name: 'BuildBoss Mobility Co.',
  status: 'operating',
  area: 'Central City',
  depotLevel: 1,
  economyTaxis: 1,
  electricTaxis: 0,
  luxuryTaxis: 0,
  drivers: 1,
  cashInvested: 13000,
  completedRides: 0,
  demandIndex: 1,
  fleetCondition: 100,
  expansionLevel: 1,
  lastShiftAt: 0,
  lastShiftRevenue: 0,
  lastShiftExpenses: 0,
};
const economics = taxiHourlyEconomics(taxi);
assert.equal(economics.revenue, 126);
assert.equal(economics.expenses, 30);
assert.equal(economics.net, 96);

const result = settleHour({
  cash: 1000,
  bank: { savingsBalance: 0, businessCheckingBalance: 0, deposits: [], loans: [], insurance: [], investors: [], savingsRateBoostUntil: 0, taxRecords: [], marketEvents: [] },
  assets: [], holdings: {}, owned: [], lifestyleAssets: [], businesses: [], taxiCompany: taxi, systemTimeMs: 1_700_000_000_000,
});
assert.equal(result.breakdown.businessRevenue, 96);
assert.equal(result.projectedHourlyNet, 96);
assert.equal(result.cashDelta, 96);
assert.match(result.ledger[0].detail, /Taxi Company/);
console.log(JSON.stringify({ ok: true, taxi: economics, settlement: { businessRevenue: result.breakdown.businessRevenue, projectedHourlyNet: result.projectedHourlyNet, cashDelta: result.cashDelta, ledgerEntries: result.ledger.length } }, null, 2));
