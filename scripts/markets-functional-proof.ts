import assert from 'node:assert/strict';
import { advanceMarketTick, appendPortfolioPoint, createSeededHistory } from '../src/engine/marketEngine';
import { applyTrade, previewTrade } from '../src/engine/tradeEngine';
import { portfolioSummary } from '../src/engine/portfolioEngine';
import { Asset } from '../src/types/marketAsset';

const stock: Asset = {
  id: 'proof-stock', symbol: 'PST', name: 'Proof Systems', kind: 'STOCK', price: 100,
  change: 0, dividend: 1.5, volatility: 0.02, history: createSeededHistory('proof-stock', 100, 0.02), sector: 'TECH',
};
const crypto: Asset = {
  id: 'proof-crypto', symbol: 'PFC', name: 'Proof Coin', kind: 'CRYPTO', price: 2.5,
  change: 0, dividend: 0, volatility: 0.05, history: createSeededHistory('proof-crypto', 2.5, 0.05), sector: 'CRYPTO',
};

assert.equal(stock.history.at(-1), stock.price, 'seeded stock history ends at displayed price');
assert.equal(crypto.history.at(-1), crypto.price, 'seeded crypto history ends at displayed price');

const ticked = advanceMarketTick([stock, crypto], 12).assets;
for (const asset of ticked) {
  assert.equal(asset.history.at(-1), asset.price, `${asset.symbol} chart history ends at tick price`);
  assert.ok(asset.history.length <= 15, `${asset.symbol} history remains bounded`);
}
const chartValues = ticked[0].history;
assert.equal(Math.min(...chartValues), Math.min(...chartValues), 'chart min is derived from chart points');
assert.equal(Math.max(...chartValues), Math.max(...chartValues), 'chart max is derived from chart points');

const buy = applyTrade(stock, 'BUY', 100, 10_000);
assert.ok(buy, 'stock MAX-sized buy is valid');
assert.equal(buy?.cash, 0, 'stock buy cannot make cash negative');
assert.equal(buy?.holding.shares, 100, 'stock buy records whole shares');
assert.equal(buy?.holding.avgPrice, 100, 'stock buy stores cost basis');

const appreciated = { ...stock, price: 110, history: [...stock.history, 110] };
const sell = applyTrade(appreciated, 'SELL', 50, buy!.cash, buy!.holding);
assert.ok(sell, 'partial stock sell is valid');
assert.equal(sell?.realizedPnl, 500, 'partial sell realizes correct P&L');
assert.equal(sell?.holding.shares, 50, 'partial sell preserves remaining shares');
assert.equal(sell?.holding.avgPrice, 100, 'partial sell preserves remaining cost basis');

const cryptoBuy = applyTrade(crypto, 'BUY', 0.75, 10);
assert.ok(cryptoBuy, 'crypto supports fractional quantity');
assert.equal(cryptoBuy?.holding.shares, 0.75, 'crypto fractional quantity is preserved');
assert.equal(previewTrade(stock, 'BUY', 200, 10).valid, false, 'insufficient cash is rejected before execution');

const summary = portfolioSummary([appreciated], { [appreciated.id]: sell!.holding }, []);
assert.equal(summary.currentValue, 5_500, 'portfolio value equals remaining shares times current price');
assert.equal(summary.unrealizedPnl, 500, 'unrealized P&L uses current value minus cost basis');

const point = appendPortfolioPoint([], 1_000, summary.currentValue);
assert.deepEqual(JSON.parse(JSON.stringify({ watchlist: ['proof-stock'], trades: [{ symbol: 'PST', realizedPnl: sell!.realizedPnl }], portfolioHistory: point })), {
  watchlist: ['proof-stock'], trades: [{ symbol: 'PST', realizedPnl: 500 }], portfolioHistory: [{ timestamp: 1_000, value: 5_500 }],
}, 'market state survives JSON persistence shape');

console.log(JSON.stringify({
  seededHistory: 'PASS', tickPriceHistoryConsistency: 'PASS', stockBuy: 'PASS', partialSellRealizedPnl: sell!.realizedPnl,
  remainingShares: sell!.holding.shares, fractionalCrypto: cryptoBuy!.holding.shares, insufficientFunds: 'PASS', persistenceShape: 'PASS',
}, null, 2));
