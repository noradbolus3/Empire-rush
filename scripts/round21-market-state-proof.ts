declare const require: any;
const assert = require('assert').strict;
import { calculateMarketPulse, recentAssetTrend } from '../src/engine/marketEngine';
import { applyTrade } from '../src/engine/tradeEngine';
import { migrateGameSave } from '../src/engine/saveMigration';
import type { Asset } from '../src/types/marketAsset';
import type { TradeRecord } from '../src/types/market';

const asset: Asset = {
  id: 'proof-stock', symbol: 'PRF', name: 'Proofline Systems', kind: 'STOCK', sector: 'TECH',
  price: 100, change: 5, dividend: 1, volatility: 0.02, history: [90, 94, 97, 99, 102, 100],
};
const pulse = calculateMarketPulse([asset]);
assert.equal(recentAssetTrend(asset), 11.11);
assert.equal(pulse.direction, 'BULLISH');
assert.equal(pulse.sectors[0].sector, 'TECH');
assert.equal(pulse.sectors[0].trendPct, 11.11);

let cash = 10_000;
let holding = undefined;
const buy = applyTrade(asset, 'BUY', 10, cash, holding);
assert.ok(buy);
if (!buy) throw new Error('buy proof trade unexpectedly failed');
cash = buy.cash;
holding = buy.holding;
const buyRecord: TradeRecord = { id: 'proof-buy', assetId: asset.id, symbol: asset.symbol, name: asset.name, side: 'BUY', quantity: 10, price: buy.price, notional: buy.total, realizedPnl: buy.realizedPnl, timestamp: 1_700_000_000_000, source: 'MARKET' };
assert.equal(cash, 9000);
assert.equal(holding.shares, 10);
assert.equal(buyRecord.notional, 1000);

const sellAsset = { ...asset, price: 110, history: [...asset.history, 110] };
const sell = applyTrade(sellAsset, 'SELL', 4, cash, holding);
assert.ok(sell);
if (!sell) throw new Error('sell proof trade unexpectedly failed');
const sellRecord: TradeRecord = { id: 'proof-sell', assetId: asset.id, symbol: asset.symbol, name: asset.name, side: 'SELL', quantity: 4, price: sell.price, notional: sell.total, realizedPnl: sell.realizedPnl, timestamp: 1_700_000_001_000, source: 'MARKET' };
assert.equal(sellRecord.realizedPnl, 40);
assert.equal(sell.holding.shares, 6);

const watchlist = [asset.id];
const reloaded = migrateGameSave(JSON.parse(JSON.stringify({ schemaVersion: 7, assets: [asset], holdings: { [asset.id]: holding }, tradeHistory: [buyRecord, sellRecord], watchlist })));
assert.equal(reloaded.schemaVersion, 8);
assert.deepEqual(reloaded.watchlist, [asset.id]);
assert.equal(reloaded.tradeHistory.length, 2);
assert.equal(reloaded.tradeHistory[1].side, 'SELL');
assert.ok(reloaded.tradeHistory[1].timestamp > reloaded.tradeHistory[0].timestamp);

console.log(JSON.stringify({
  marketPulse: { direction: pulse.direction, averageTrendPct: pulse.averageTrendPct, positiveBreadthPct: pulse.positiveBreadthPct, sector: pulse.sectors[0] },
  testTrade: { buy: buyRecord, sell: sellRecord, cashAfterBuy: cash, sharesAfterSell: sell.holding.shares },
  persistenceReload: { schemaVersion: reloaded.schemaVersion, watchlist: reloaded.watchlist, tradeRecords: reloaded.tradeHistory.length, newestTrade: reloaded.tradeHistory[1] },
}, null, 2));
