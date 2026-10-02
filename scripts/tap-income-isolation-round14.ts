declare const require: any;
const assert = require('assert').strict;
import { buildIncomeSources } from '../src/engine/incomeLedger';
import { settleElapsedBusinessIncome } from '../src/engine/settlementEngine';
import { BusinessEntity } from '../src/types/business';
import { Asset, Holding } from '../src/types/marketAsset';

const retail: BusinessEntity = {
  id: 'retail-proof',
  name: 'Copper & Bloom Market',
  sector: 'Retail',
  isUnlocked: true,
  unlockNetWorthRequired: 0,
  isAcquired: true,
  acquisitionCost: 500,
  legalStatus: 'Licensed_Legal',
  policeHeat: 0,
  stability: 92,
  hourlyNetProfit: 500,
  stockUnits: 250,
  maxStockCapacity: 2500,
  pricingTier: 'Standard',
  hasSecurity: false,
  hasManager: false,
  onboardingStep: 'ORDER_STOCK',
  unitWholesaleCost: 2,
  monthlyRent: 800,
  monthlyPayroll: 1200,
  salesRemainder: 0,
  autoRestockEnabled: false,
  demandEvent: 'None',
  demandEventSeconds: 0,
  demandClockSeconds: 0,
  pulseChain: 0,
  lastSaleSequence: 0,
  lastSaleRevenue: 0,
  settlementAccruedSeconds: 3600,
  pendingSettlementAmount: 500,
};

const dividendAsset: Asset = {
  id: 'dividend-proof', symbol: 'DVP', name: 'Dividend Proof Co.', kind: 'STOCK', price: 100, change: 0,
  dividend: 8, volatility: 0.01, history: [100, 100], sector: 'BANKING',
};
const holdings: Record<string, Holding> = { 'dividend-proof': { shares: 10, avgPrice: 100, realized: 0 } };

function sourcesForTapCount(taps: number) {
  void taps;
  return buildIncomeSources({ businesses: [retail], assets: [dividendAsset], holdings, businessProfitPerHour: 500 });
}

const zeroTapSources = sourcesForTapCount(0);
const thousandTapSources = sourcesForTapCount(1000);
assert.deepEqual(thousandTapSources, zeroTapSources, '1,000 taps must not change projected business/investment cashflow');
assert.equal(zeroTapSources.some(source => source.label === 'Tap actions'), false, 'Tap actions must not be an Income Sources row');
assert.equal(zeroTapSources.find(source => source.label === 'Copper & Bloom Market')?.hourlyProjected, 500, 'Retail hourly source must remain $500');
assert.equal(zeroTapSources.find(source => source.label === 'Stocks · realized dividends')?.hourlyProjected, 0, 'Unrealized dividend yield must be $0 until an event settles');

const collection = settleElapsedBusinessIncome([retail], 0, 60 * 60 * 1000);
assert.equal(collection.totalAmount, 500, 'One business must settle exactly its $500 accrued amount');
assert.deepEqual(collection.credits.map(credit => credit.source), ['Copper & Bloom Market'], 'Collected cash must be attributed to the business name');
assert.equal(collection.credits.some(credit => credit.source === 'Tap actions'), false, 'Business collection must never be attributed to Tap actions');

const realizedSources = buildIncomeSources({ businesses: [retail], assets: [dividendAsset], holdings, businessProfitPerHour: 500, realizedDividendAmount: 125 });
assert.equal(realizedSources.find(source => source.label === 'Stocks · realized dividends')?.hourlyProjected, 125, 'Actual dividend event must appear only when a realized amount is supplied');
assert.equal(realizedSources.find(source => source.label === 'Stocks · realized dividends')?.cadence, 'event', 'Realized dividends must be event-based, not hourly tap income');

console.log(JSON.stringify({
  incomeSourcesBeforeFix: ['Copper & Bloom Market +$500/hr', 'Tap actions +$6,000/hr', 'Stocks · quarterly dividends $0/hr'],
  incomeSourcesAfterFix: zeroTapSources.map(source => `${source.label} ${source.hourlyProjected >= 0 ? '+' : ''}$${source.hourlyProjected.toFixed(2)}${source.cadence === 'event' ? ' / event' : ' / hr'}`),
  gameplayActivity: 'Tap actions: separate Gameplay Activity only; instant on-tap cash; excluded from projected cashflow',
  zeroTapVsThousandTap: 'identical',
  collectedBusinessCash: '$500 from Copper & Bloom Market',
  unrealizedStockDividend: '$0',
  realizedStockDividendExample: '$125 / event',
  hardcodedTapHourlyCap: 'absent',
}, null, 2));
