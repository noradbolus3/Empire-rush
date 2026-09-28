declare const require: any;
const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');

import { advanceMarketTick, createSeededHistory, matchLimitOrders } from '../src/engine/marketEngine';
import { applyTrade, quantityFromCashPercent } from '../src/engine/tradeEngine';
import { migrateGameSave } from '../src/engine/saveMigration';

require.extensions['.webp'] = () => undefined;
const { CARS_DATA } = require('../src/data/carsData') as typeof import('../src/data/carsData');

const root = process.cwd();
const app = fs.readFileSync(path.join(root, 'App.tsx'), 'utf8');
const marketScreen = fs.readFileSync(path.join(root, 'src/screens/MarketScreen.tsx'), 'utf8');
const assetCard = fs.readFileSync(path.join(root, 'src/screens/AssetCard.tsx'), 'utf8');
const carsSource = fs.readFileSync(path.join(root, 'src/data/carsData.ts'), 'utf8');

const stock = {
  id: 'proof-stock', symbol: 'PST', name: 'Proof Systems', kind: 'STOCK' as const,
  price: 100, change: 0, dividend: 2, volatility: 0.02, history: createSeededHistory('proof-stock', 100, 0.02), sector: 'TECH' as const,
};

const moved = advanceMarketTick([stock], 1);
assert.equal(moved.assets.length, 1, 'stock list should remain loaded');
assert.equal(moved.assets[0].history.length, 15, 'price simulation should maintain the restored rolling history window');
assert.notEqual(moved.assets[0].price, stock.price, 'price simulation should move the asset');

const bought = applyTrade(stock, 'BUY', quantityFromCashPercent(stock, 1_000, 1), 1_000);
assert(bought && bought.cash === 0 && bought.holding.shares === 10, 'BUY should update cash and holdings');
const sold = applyTrade({ ...stock, price: 110 }, 'SELL', 5, bought!.cash, bought!.holding);
assert(sold && sold.cash === 550 && sold.holding.shares === 5 && sold.realizedPnl === 50, 'SELL should update holdings and realized P&L');

const limit = matchLimitOrders([{ ...stock, price: 99 }], [{ id: 'limit-1', assetId: stock.id, side: 'BUY', quantity: 2, limitPrice: 100, createdAt: 1, status: 'OPEN' }], 2);
assert.equal(limit.fills.length, 1, 'BUY limit order should fill at or below limit');

const reloaded = migrateGameSave({ schemaVersion: 5, assets: [stock], holdings: { [stock.id]: { shares: 5, realized: 50 } }, tradeHistory: [] });
assert.equal(reloaded.holdings[stock.id].shares, 5, 'saved holdings should survive migration');
assert.equal(reloaded.holdings[stock.id].avgPrice, 100, 'legacy basis should start at current price');

assert.match(app, /ResponsiveMarketScreen/, 'Markets must remain connected to App navigation');
assert(app.includes('["markets", "↗", "MARKETS"]'), 'Markets navigation entry must remain present');
assert.match(marketScreen, /BUY/);
assert.match(marketScreen, /SELL/);
assert.match(marketScreen, /SET LIMIT/);
assert.match(marketScreen, /TRADE LOG/);
assert.match(app, /setTradeHistory\(previous => capTradeHistory/);

const mappings = [...carsSource.matchAll(/id: '([^']+)'[^\n]*image: require\('([^']+)'\)/g)].map(match => ({ id: match[1], relative: match[2] }));
assert.equal(mappings.length, 30, 'all 30 cars must have static image mappings');
assert.equal(new Set(mappings.map(item => item.relative)).size, mappings.length, 'car image mappings must be one-to-one');
for (const mapping of mappings) {
  const absolute = path.resolve(root, 'src/data', mapping.relative);
  assert(fs.existsSync(absolute), `missing car image: ${mapping.relative}`);
}
const firstFive = CARS_DATA.slice(0, 5).map(item => ({ id: item.id, name: item.name, image: mappings.find(mapping => mapping.id === item.id)?.relative }));
assert(firstFive.every(item => item.image), 'first five cars must have image references');
const firstFiveBytes = firstFive.map(item => fs.readFileSync(path.resolve(root, 'src/data', item.image!)));
assert.equal(new Set(firstFiveBytes.map(bytes => bytes.toString('base64'))).size, 5, 'first five car assets must be visibly distinct files');
assert.match(assetCard, /item\.image \? <Image source=\{item\.image\}/, 'AssetCard must render the assigned image field');
assert.match(assetCard, /IMAGE UNAVAILABLE/, 'missing car images must use explicit static fallback');
assert.doesNotMatch(assetCard, /Math\.random|random|react-native-svg|emoji/i, 'AssetCard must not generate or substitute images at runtime');

console.log(JSON.stringify({
  markets: { stockList: 'PASS', simulation: 'PASS', buy: 'PASS', sell: 'PASS', limitOrder: 'PASS', tradeLogWiring: 'PASS', saveReloadHoldings: 'PASS', navigation: 'PASS' },
  carMappings: firstFive,
  cars: { count: mappings.length, uniqueImages: new Set(mappings.map(item => item.relative)).size, firstFiveDistinct: true, fallback: 'IMAGE UNAVAILABLE' },
  runtimeScreenshots: 'NOT DONE (no emulator/device run in this round)'
}, null, 2));
