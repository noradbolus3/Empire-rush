declare const require: any;
declare const process: any;
const fs: any = require('fs');
const path: any = require('path');
const assert: any = require('assert').strict;
require.extensions['.webp'] = () => undefined;
const { CARS_DATA } = require('../src/data/carsData') as typeof import('../src/data/carsData');
const { YACHTS_DATA } = require('../src/data/yachtsData') as typeof import('../src/data/yachtsData');
const { JETS_DATA } = require('../src/data/jetsData') as typeof import('../src/data/jetsData');
const { PROPERTIES_DATA } = require('../src/data/propertiesData') as typeof import('../src/data/propertiesData');
const { STOCK_CATALOG } = require('../src/data/stocksData') as typeof import('../src/data/stocksData');
const { CRYPTO_CATALOG } = require('../src/data/cryptoData') as typeof import('../src/data/cryptoData');

const root = process.cwd();
const banned = [
  'toyota','honda','nissan','mazda','subaru','ford','chevrolet','cadillac','buick','gmc','dodge','jeep','chrysler','tesla','rivian','lucid','ferrari','lamborghini','porsche','mclaren','bugatti','bentley','rolls royce','aston martin','maserati','lotus','koenigsegg','pagani','bmw','mercedes','audi','volkswagen','volvo','lexus','acura','infiniti','genesis','yamaha','honda marine','searay','azimut','benetti','ferretti','sunseeker','princess yachts','ocean alexander','gulfstream','bombardier','embraer','cessna','beechcraft','boeing','airbus','lockheed','raytheon','spacex','apple','microsoft','amazon','google','alphabet','meta','nvidia','intel','amd','oracle','netflix','disney','visa','mastercard','jpmorgan','goldman sachs','pfizer','moderna','merck','exxon','chevron','shell','walmart','costco','coca cola','pepsi'
];
const collections = { cars: CARS_DATA, yachts: YACHTS_DATA, jets: JETS_DATA, properties: PROPERTIES_DATA };
const result: any = { collections: {}, stocks: {} };
const allNames: string[] = [];
const allImages: string[] = [];
for (const [category, items] of Object.entries(collections)) {
  assert(items.length >= 30, `${category} must contain at least 30 items`);
  const names = items.map(item => item.name.toLowerCase());
  assert.equal(new Set(names).size, items.length, `${category} names must be unique`);
  const source = fs.readFileSync(path.join(root, 'src', 'data', `${category}Data.ts`), 'utf8');
  const paths = [...source.matchAll(/require\('([^']+\.webp)'\)/g)].map(match => match[1]);
  assert.equal(new Set(paths).size, items.length, `${category} image paths must be unique`);
  for (const assetPath of paths) assert(fs.existsSync(path.resolve(root, 'src', 'data', assetPath)), `${category} image missing: ${assetPath}`);
  for (let i = 1; i < items.length; i += 1) assert(items[i].price > items[i - 1].price, `${category} prices must rise smoothly at item ${i}`);
  result.collections[category] = { count: items.length, minPrice: items[0].price, maxPrice: items.at(-1)?.price, minImageBytes: Math.min(...paths.map(assetPath => fs.statSync(path.resolve(root, 'src', 'data', assetPath)).size)), maxImageBytes: Math.max(...paths.map(assetPath => fs.statSync(path.resolve(root, 'src', 'data', assetPath)).size)) };
  allNames.push(...names); allImages.push(...paths);
}
assert.equal(new Set(allNames).size, allNames.length, 'all lifestyle names must be globally unique');
assert.equal(new Set(allImages).size, allImages.length, 'all lifestyle image paths must be globally unique');
const stockNames = STOCK_CATALOG.map(stock => stock.name.toLowerCase());
assert.equal(STOCK_CATALOG.length, 31, 'Round 25 must contain exactly 31 stocks');
assert.equal(new Set(stockNames).size, STOCK_CATALOG.length, 'stock names must be unique');
assert(new Set(STOCK_CATALOG.map(stock => stock.sector)).size >= 10, 'stocks must span at least ten sectors');
assert(STOCK_CATALOG.every(stock => stock.price >= 20 && stock.price <= 1000), 'stock prices must stay in a sensible simulated range');
assert(STOCK_CATALOG.every(stock => stock.description.length >= 20), 'every stock needs a one-line description');
assert.equal(CRYPTO_CATALOG.length, 14, 'Round 25 must contain exactly 14 crypto assets');
assert.equal(new Set(CRYPTO_CATALOG.map(asset => asset.name.toLowerCase())).size, CRYPTO_CATALOG.length, 'crypto names must be unique');
assert.equal(new Set(CRYPTO_CATALOG.map(asset => asset.logo)).size, CRYPTO_CATALOG.length, 'crypto logos must be unique');
const checkedText = [...allNames, ...stockNames, fs.readFileSync(path.join(root, 'src', 'data', 'stocksData.ts'), 'utf8').toLowerCase()].join(' ');
for (const brand of banned) { const pattern = new RegExp(`\\b${brand.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'i'); assert(!pattern.test(checkedText), `banned real brand string found: ${brand}`); }
result.stocks = { count: STOCK_CATALOG.length, sectors: Array.from(new Set(STOCK_CATALOG.map(stock => stock.sector))), minPrice: Math.min(...STOCK_CATALOG.map(stock => stock.price)), maxPrice: Math.max(...STOCK_CATALOG.map(stock => stock.price)) };
result.crypto = { count: CRYPTO_CATALOG.length, categories: Array.from(new Set(CRYPTO_CATALOG.map(asset => asset.category))) };
console.log(JSON.stringify({ ok: true, ...result }, null, 2));
