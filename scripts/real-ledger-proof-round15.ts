declare const require: any;
const assert = require('assert').strict;
import { buildIncomeSources } from '../src/engine/incomeLedger';
import { DEFAULT_BUSINESSES } from '../src/engine/businessSimulation';

const retailBase = DEFAULT_BUSINESSES.find(item => item.id === 'apex-retail');
const mobilityBase = DEFAULT_BUSINESSES.find(item => item.id === 'metro-mobility');
if (!retailBase || !mobilityBase) throw new Error('Expected Retail and Mobility defaults are missing');

const businesses = [
  { ...retailBase, isAcquired: true, hourlyNetProfit: 578.60 },
  { ...mobilityBase, id: 'ammu-cab', name: 'Ammu cab', isAcquired: true, hourlyNetProfit: 750.32 },
];

const sources = buildIncomeSources({
  businesses,
  assets: [],
  holdings: {},
  businessProfitPerHour: 1_328.92,
});
const businessSources = sources.filter(source => source.label !== 'Stocks · realized dividends');
const total = Number(businessSources.reduce((sum, source) => sum + source.hourlyProjected, 0).toFixed(2));
const percentages = Object.fromEntries(businessSources.map(source => [source.label, Number((source.hourlyProjected / total * 100).toFixed(2))]));

assert.equal(total, 1328.92, 'Projected cashflow must total $1,328.92');
assert.equal(businessSources.find(source => source.label === 'Copper & Bloom Market')?.hourlyProjected, 578.60);
assert.equal(businessSources.find(source => source.label === 'Ammu cab')?.hourlyProjected, 750.32);
assert.equal(percentages['Copper & Bloom Market'], 43.54);
assert.equal(percentages['Ammu cab'], 56.46);
assert.equal(sources.find(source => source.label === 'Stocks · realized dividends')?.hourlyProjected, 0);

console.log(JSON.stringify({
  activeBusinesses: businesses.map(business => ({ name: business.name, hourlyNetProfit: business.hourlyNetProfit })),
  projectedCashflowPerHour: total,
  percentages,
  stocksUntilDividendEvent: sources.find(source => source.label === 'Stocks · realized dividends')?.hourlyProjected,
}, null, 2));
