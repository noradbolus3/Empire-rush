declare const require: any;
const assert = require('assert').strict;
const fs = require('fs');
import { calculateMarketPulse } from '../src/engine/marketEngine';
import { portfolioAllocation, portfolioRangePoints } from '../src/engine/portfolioEngine';
import { isDuplicateTrade } from '../src/engine/tradeEngine';
import { migrateGameSave, GAME_SAVE_VERSION } from '../src/engine/saveMigration';

const source = (file: string) => fs.readFileSync(file, 'utf8');
const asset = (id: string, sector: 'TECH' | 'ENERGY', price: number, history: number[]) => ({ id, symbol: id.toUpperCase(), name: id, kind: 'STOCK' as const, sector, price, change: 0, dividend: 2, volatility: .02, history });

const pulse = calculateMarketPulse([
  asset('up', 'TECH', 110, [100, 104, 108, 110]),
  asset('down', 'ENERGY', 90, [100, 97, 94, 90]),
]);
assert.equal(pulse.direction, 'MIXED');
assert.equal(pulse.positiveBreadthPct, 50);
assert.equal(pulse.sectors.length, 2);
assert.equal(pulse.sectors[0].trendPct > 0, true);

const now = Date.UTC(2026, 0, 10);
const points = [{ timestamp: now - 31 * 86400000, value: 1 }, { timestamp: now - 2 * 86400000, value: 2 }, { timestamp: now, value: 3 }];
assert.equal(portfolioRangePoints(points, '1D', now).length, 1);
assert.equal(portfolioRangePoints(points, '1W', now).length, 2);
assert.equal(portfolioRangePoints(points, '1M', now).length, 2);
const allocations = portfolioAllocation([asset('up', 'TECH', 110, [100, 110])], { up: { shares: 2, avgPrice: 100, realized: 0, realizedPnl: 0 } }, 80);
assert.deepEqual(allocations.map(item => item.label), ['TECH', 'CASH']);
assert.equal(allocations.reduce((sum, item) => sum + item.percentage, 0), 100);

assert.equal(isDuplicateTrade(undefined, 'up', 'BUY', 1, 1000), false);
assert.equal(isDuplicateTrade({ assetId: 'up', side: 'BUY', quantity: 1, at: 1000 }, 'up', 'BUY', 1, 1200), true);
assert.equal(isDuplicateTrade({ assetId: 'up', side: 'BUY', quantity: 1, at: 1000 }, 'up', 'BUY', 1, 1600), false);

const migrated = migrateGameSave({ schemaVersion: 8, tradeHistory: [{ assetId: 'up', side: 'BUY', quantity: 1, price: 100 }, { assetId: 7 }], watchlist: ['up', 'up', 7], limitOrders: [{ assetId: 'up', side: 'BUY', quantity: 1, limitPrice: 90, status: 'OPEN' }, { assetId: 'bad', side: 'NOPE', quantity: 1, limitPrice: 1, status: 'OPEN' }], portfolioHistory: [{ timestamp: now, value: 3 }, { timestamp: 'bad', value: 4 }] });
assert.equal(GAME_SAVE_VERSION, 9);
assert.equal(migrated.tradeHistory.length, 1);
assert.deepEqual(migrated.watchlist, ['up']);
assert.equal(migrated.limitOrders.length, 1);
assert.equal(migrated.portfolioHistory.length, 1);

const marketScreen = source('src/screens/MarketScreen.tsx');
const app = source('App.tsx');
assert.match(marketScreen, /BULLISH.*BEARISH.*MIXED|marketPulse\.direction/);
assert.match(marketScreen, /tradeFilter/);
assert.match(marketScreen, /REMOVE ALL/);
assert.match(marketScreen, /ALLOCATION/);
assert.match(marketScreen, /1D.*1W.*1M/);
assert.match(app, /isDuplicateTrade/);
assert.match(app, /tradeHistory/);
assert.match(app, /watchlist/);

console.log(JSON.stringify({
  marketPulse: { direction: pulse.direction, averageTrendPct: pulse.averageTrendPct, positiveBreadthPct: pulse.positiveBreadthPct },
  portfolioRanges: { '1D': portfolioRangePoints(points, '1D', now).length, '1W': portfolioRangePoints(points, '1W', now).length, '1M': portfolioRangePoints(points, '1M', now).length },
  allocation: allocations,
  duplicateTradeGuard: 'PASS',
  migration: { schemaVersion: migrated.schemaVersion, validTrades: migrated.tradeHistory.length, watchlist: migrated.watchlist.length, validLimitOrders: migrated.limitOrders.length },
  uiWiring: 'PASS'
}, null, 2));
