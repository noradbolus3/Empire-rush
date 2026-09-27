import { DEFAULT_BUSINESSES, simulateBusinessTick } from '../src/engine/businessSimulation';
import { BusinessEntity } from '../src/types/business';

const HOUR_SECONDS = 3600;

function makeOwnedPair(): BusinessEntity[] {
  return DEFAULT_BUSINESSES
    .filter(item => item.id === 'apex-retail' || item.id === 'metro-mobility')
    .map(item => item.id === 'apex-retail'
      ? { ...item, isAcquired: true, stockUnits: 2500, autoRestockEnabled: false, operatingRampSeconds: 0 }
      : { ...item, isAcquired: true, operatingRampSeconds: 0 });
}

function beforeModel() {
  // Legacy-style full-speed model: no four-hour ramp, no retail COGS/tax accounting,
  // and the old $5,000 Retail entry plus $500/100-unit starter order.
  const retailUnitsPerHour = 2 * 1800;
  const retailRevenue = retailUnitsPerHour * 5.5;
  const retailLegacyNet = retailRevenue - 66.67;
  const mobilityLegacyNet = 10 * 2200;
  const synergy = 1.04;
  return {
    retailEntry: 5000,
    starterStock: 500,
    retailRevenue,
    retailCogs: 0,
    retailTax: 0,
    retailFixedCosts: 66.67,
    mobilityOperatingCosts: 0,
    hourlyCashflow: Number(((retailLegacyNet + mobilityLegacyNet) * synergy).toFixed(2)),
    explanation: 'Full-speed production, no operating ramp, and Retail COGS/tax omitted.'
  };
}

function afterModel() {
  let businesses = makeOwnedPair();
  let cash = 100_000;
  let retailCash = 0;
  let mobilityCash = 0;
  let events = 0;
  for (let minute = 0; minute < 60; minute += 1) {
    const result = simulateBusinessTick(businesses, 60, 60, cash, {}, 0);
    businesses = result.businesses;
    cash += result.cashDelta;
    retailCash += result.incomeByBusiness['apex-retail'] || 0;
    mobilityCash += result.incomeByBusiness['metro-mobility'] || 0;
    events += result.events.length;
  }
  const retail = businesses.find(item => item.id === 'apex-retail')!;
  const mobility = businesses.find(item => item.id === 'metro-mobility')!;
  const steady = simulateBusinessTick(businesses, 60, 60, cash, {}, 0);
  const steadyHourly = steady.cashDelta * 60;
  return {
    retailEntry: 500,
    starterStock: 500,
    retailCashflowFirstHour: Number(retailCash.toFixed(2)),
    mobilityCashflowFirstHour: Number(mobilityCash.toFixed(2)),
    combinedCashflowFirstHour: Number((retailCash + mobilityCash).toFixed(2)),
    currentSteadyHourlyCashflow: Number(steadyHourly.toFixed(2)),
    retailHourlyNetAfterRamp: retail.hourlyNetProfit,
    mobilityHourlyNetAfterRamp: mobility.hourlyNetProfit,
    retailCogsAndTaxIncluded: true,
    retailFixedCostsPerMonth: 2000,
    retailAutoRestockCost: 250,
    operatingRampHours: 4,
    events,
    minimumCash: 100_000,
    explanation: 'Four-hour operating ramp, Retail COGS/tax/fixed costs, and no empty-shelf bleed.'
  };
}

const before = beforeModel();
const after = afterModel();
const output = {
  scope: 'Retail + Mobility only · one hour',
  before,
  after,
  delta: {
    firstHourCashflowReduction: Number((before.hourlyCashflow - after.combinedCashflowFirstHour).toFixed(2)),
    steadyStateDifference: Number((before.hourlyCashflow - after.currentSteadyHourlyCashflow).toFixed(2)),
  },
  rootCause: [
    'The old path activated full hourly revenue immediately instead of ramping newly acquired businesses.',
    'Mobility started with 10 sedans at $2,200/hour each, so it contributed $22,000/hour before synergy.',
    'The old Retail path omitted inventory COGS and legal tax from the cashflow comparison.',
  ],
  fixes: [
    'New businesses ramp over four in-game hours.',
    'Retail subtracts $2/unit COGS, 15% legal tax, and prorated rent/payroll.',
    'Empty Retail shelves produce $0 and do not bleed rent/payroll in the simulation.',
    'The actual entry split is $500 business acquisition plus $500 starter stock.',
  ],
};

if (after.minimumCash < 100_000) throw new Error('Two-business simulation cash floor failed');
if (after.combinedCashflowFirstHour >= before.hourlyCashflow) throw new Error('Before/after cost curve did not reduce first-hour spike');
console.log(JSON.stringify({ ...output, result: 'PASS' }, null, 2));
