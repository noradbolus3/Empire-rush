declare const require: any;
const assert = require('assert').strict;
import { Asset, Holding } from '../src/types/marketAsset';
import { applyTrade, estimatePriceImpact, quantityFromCashPercent, quantityFromHoldingPercent, previewTrade } from '../src/engine/tradeEngine';
import { holdingUnrealizedPnl, normalizeHoldings, portfolioSummary } from '../src/engine/portfolioEngine';
import { migrateGameSave, GAME_SAVE_VERSION } from '../src/engine/saveMigration';

const stock: Asset = { id: 'proof-stock', symbol: 'PST', name: 'Proof Systems', kind: 'STOCK', price: 100, change: 0, dividend: 0, volatility: .02, history: [100, 100], sector: 'TECH' };
const crypto: Asset = { id: 'proof-crypto', symbol: 'PCT', name: 'Proof Coin', kind: 'CRYPTO', price: 0.72, change: 0, dividend: 0, volatility: .04, history: [.72, .72], sector: 'CRYPTO' };

const maxStockQuantity = quantityFromCashPercent(stock, 10_000, 1);
assert.equal(maxStockQuantity, 100, 'stock MAX must floor to 100 whole shares');
const stockBuy = applyTrade(stock, 'BUY', maxStockQuantity, 10_000);
assert(stockBuy, 'stock MAX buy should execute');
assert.equal(stockBuy!.cash, 0);
assert.equal(stockBuy!.holding.shares, 100);
assert.equal(stockBuy!.holding.avgPrice, 100);
assert.equal(holdingUnrealizedPnl(stockBuy!.holding, 110), 1_000);

const half = quantityFromHoldingPercent(stock, stockBuy!.holding, .5);
assert.equal(half, 50);
const stockSell = applyTrade({ ...stock, price: 110 }, 'SELL', half, stockBuy!.cash, stockBuy!.holding);
assert(stockSell, '50% stock sell should execute');
assert.equal(stockSell!.realizedPnl, 500);
assert.equal(stockSell!.holding.shares, 50);
assert.equal(stockSell!.holding.avgPrice, 100);

const maxCryptoQuantity = quantityFromCashPercent(crypto, 10, 1);
const cryptoPreview = previewTrade(crypto, 'BUY', maxCryptoQuantity, 10);
const cryptoBuy = applyTrade(crypto, 'BUY', maxCryptoQuantity, 10);
assert(cryptoBuy, 'fractional crypto MAX buy should execute');
assert(maxCryptoQuantity > 13 && maxCryptoQuantity < 14, 'crypto MAX should be fractional');
assert.equal(cryptoBuy!.cash, 0);
assert.equal(cryptoBuy!.holding.shares, maxCryptoQuantity);
assert.equal(cryptoPreview.cashAfter, 0);

const migrated = migrateGameSave({ schemaVersion: 5, assets: [stock], holdings: { 'proof-stock': { shares: 2, realized: 0 } } });
assert.equal(GAME_SAVE_VERSION, 7);
assert.equal(migrated.holdings['proof-stock'].avgPrice, 100, 'legacy holdings must start basis at current price');
assert.deepEqual(migrated.tradeHistory, []);

const impacted = estimatePriceImpact(stock, 1_000);
assert(impacted > 0 && impacted <= .03, 'large order price impact must be bounded and non-zero');
const summary = portfolioSummary([{ ...stock, price: 110 }], { 'proof-stock': stockSell!.holding }, [{ id: 'sell-1', assetId: stock.id, symbol: stock.symbol, name: stock.name, side: 'SELL', quantity: 50, price: 110, notional: 5500, realizedPnl: 500, timestamp: 1, source: 'MARKET' }]);
assert.equal(summary.totalInvested, 5000);
assert.equal(summary.currentValue, 5500);
assert.equal(summary.unrealizedPnl, 500);
assert.equal(summary.realizedPnl, 500);

console.log(JSON.stringify({
  stockMaxBuy: { quantity: maxStockQuantity, cashAfter: stockBuy!.cash, avgCost: stockBuy!.holding.avgPrice },
  priceAt110: { unrealizedPnl: holdingUnrealizedPnl(stockBuy!.holding, 110) },
  halfSell: { quantity: half, realizedPnl: stockSell!.realizedPnl, remainingShares: stockSell!.holding.shares, remainingAvgCost: stockSell!.holding.avgPrice },
  cryptoMaxBuy: { quantity: maxCryptoQuantity, cashAfter: cryptoBuy!.cash },
  legacyMigration: { schemaVersion: migrated.schemaVersion, migratedAvgCost: migrated.holdings['proof-stock'].avgPrice },
  largeOrderImpactPct: Number((impacted * 100).toFixed(4)),
  summary,
}, null, 2));
