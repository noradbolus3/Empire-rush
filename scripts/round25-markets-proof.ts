// @ts-nocheck
const assert = require('node:assert/strict');
const fs = require('node:fs');
require.extensions['.webp'] = (module, filename) => { module.exports = filename; };
const { STOCK_CATALOG } = require('../src/data/stocksData');
const { CRYPTO_CATALOG, cryptoCatalogAsset } = require('../src/data/cryptoData');
const { calculateSimulatedIndex, simulatedEventForAsset, createSeededHistory } = require('../src/engine/marketEngine');
const moduleSource = fs.readFileSync('src/screens/markets/MarketsModuleScreen.tsx', 'utf8');
const appSource = fs.readFileSync('App.tsx', 'utf8');

const stockNames = ['MicroSift','Guglo','Amazone','Teslah','Nvidiya','Netfliks','Applix','Samsong','Toyoda Motors','CocaCora','Pepsicoa',"McDonel's",'Adidaz','Nikora','Sonya','Oraclen','MetaVerse Labs','PayPalio','MasterCardia','VisaNova','JPMorganix','Goldmanex','ModernaX','Pfizera','SpaceYard','RocketX','Walmartia','Starbuxx','Uberix','AirBnbia','Adobeon'];
const cryptoNames = ['Bitron','EtheriumX','Solaxis','DogeMax','Polymera','Neon Protocol','Arcade Ledger','UniDex','LunaPrime','VaultMesh','CardanoX','Rippleon','ShibaNova','AvalonX'];
assert.equal(STOCK_CATALOG.length, 31);
assert.equal(CRYPTO_CATALOG.length, 14);
assert.deepEqual(STOCK_CATALOG.map(x => x.name), stockNames);
assert.deepEqual(CRYPTO_CATALOG.map(x => x.name), cryptoNames);
assert.equal(new Set(STOCK_CATALOG.map(x => x.symbol)).size, 31);
assert.equal(new Set(CRYPTO_CATALOG.map(x => x.symbol)).size, 14);
assert.equal(new Set(STOCK_CATALOG.map(x => x.logo)).size, 31);
assert.equal(new Set(CRYPTO_CATALOG.map(x => x.logo)).size, 14);
for (const item of STOCK_CATALOG) assert(fs.existsSync(item.logo), `missing stock logo ${item.name}`);
for (const item of CRYPTO_CATALOG) assert(fs.existsSync(item.logo), `missing crypto logo ${item.name}`);
const assets = STOCK_CATALOG.map(item => ({ ...item, kind: 'STOCK', change: 0, dividend: item.dividendYield, history: createSeededHistory(item.id, item.price, item.volatility) })).concat(CRYPTO_CATALOG.map(cryptoCatalogAsset));
for (const name of ['Empire Global','North America','Asia Pacific','Europe 50','Tech Index','Energy Index','Banking Index','Consumer Index','Industrial Index']) {
  const index = calculateSimulatedIndex(name, assets);
  assert(index.constituents.length > 0, `${name} has no constituents`);
  assert(Number.isFinite(index.value) && Number.isFinite(index.changePct));
}
const event = simulatedEventForAsset(assets[0], 12);
assert(event.headline.includes('software') || event.headline.includes('market'));
assert.equal(event.assetId, assets[0].id);
assert.match(moduleSource, /Stocks/);
assert.match(moduleSource, /Crypto/);
for (const screen of ['MarketHome','ListScreen','DetailScreen','PortfolioScreen','WatchlistScreen','OrdersScreen','TransactionsScreen','IndicesScreen','IndexDetail','MoversScreen','EventsScreen','TradeSheet']) assert(moduleSource.includes(`function ${screen}`), `${screen} missing`);
assert.match(moduleSource, /MARKET.*LIMIT/);
assert.match(moduleSource, /CONFIRM/);
assert.match(moduleSource, /SIMULATED EVENT/);
assert.match(moduleSource, /No positions/);
assert.match(moduleSource, /fallback/);
assert.match(appSource, /CRYPTO_CATALOG.map/);
assert.doesNotMatch(moduleSource, /NaN/);
console.log(JSON.stringify({
  ok: true,
  catalog: { stocks: STOCK_CATALOG.length, crypto: CRYPTO_CATALOG.length, uniqueStockLogos: 31, uniqueCryptoLogos: 14 },
  indexConstituents: Object.fromEntries(['Empire Global','North America','Asia Pacific','Europe 50','Tech Index','Energy Index','Banking Index','Consumer Index','Industrial Index'].map(name => [name, calculateSimulatedIndex(name, assets).constituents.length])),
  event: { assetId: event.assetId, sector: event.sector, headline: event.headline, impactPct: event.impactPct },
  screens: ['Markets Home','Stocks','Stock Detail','Portfolio','Watchlist','Orders','Transactions','Indices','Index Detail','Movers','Events','Crypto Home','Crypto'],
  noNaNSourceGuard: true,
}, null, 2));
