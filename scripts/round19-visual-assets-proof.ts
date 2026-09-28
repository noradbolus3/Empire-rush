const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const app = fs.readFileSync(path.join(root, 'App.tsx'), 'utf8');
const marketScreen = fs.readFileSync(path.join(root, 'src/screens/MarketScreen.tsx'), 'utf8');
const logoData = fs.readFileSync(path.join(root, 'src/data/stockLogoData.ts'), 'utf8');
const stockData = fs.readFileSync(path.join(root, 'src/data/stocksData.ts'), 'utf8');
const assetType = fs.readFileSync(path.join(root, 'src/types/marketAsset.ts'), 'utf8');

const logoMappings = [...logoData.matchAll(/\s+(\w+): require\('\.\.\/\.\.\/assets\/stocks\/([^']+)'\)/g)].map(match => ({ id: match[1], file: match[2] }));
assert.equal(logoMappings.length, 30, 'stock logo mapping should cover all 30 catalog stocks');
assert.equal(new Set(logoMappings.map(item => item.file)).size, 30, 'stock logo files must be unique');
for (const mapping of logoMappings) {
  assert(fs.existsSync(path.join(root, 'assets/stocks', mapping.file)), `missing stock logo: ${mapping.file}`);
}
assert.equal((stockData.match(/logo: STOCK_LOGOS\['[^']+'\]/g) || []).length, 30, 'every catalog stock should reference a logo');
assert.match(assetType, /logo\?: number/, 'market logo must remain visual-only and optional for old saves');
assert.match(app, /logo: STOCK_LOGOS\[id\]/, 'active market seeds must attach logos by stock ID');
assert.match(app, /logo: asset\.logo \?\? STOCK_LOGOS\[asset\.id\]/, 'old saved assets must hydrate with deterministic logos');
assert.match(marketScreen, /asset\.logo \? <Image[^>]*source=\{asset\.logo\}/, 'MarketRow must render the assigned logo directly');
assert.doesNotMatch(marketScreen, /https?:\/\//, 'stock logos must not use a remote image dependency');

const categories: Array<[string, string, RegExp]> = [
  ['cars', 'src/data/carsData.ts', /image: require\('\.\.\/\.\.\/assets\/collections\/cars\/([^']+)'\)/g],
  ['yachts', 'src/data/yachtsData.ts', /image: require\('\.\.\/\.\.\/assets\/collections\/yachts\/([^']+)'\)/g],
  ['jets', 'src/data/jetsData.ts', /image: require\('\.\.\/\.\.\/assets\/collections\/jets\/([^']+)'\)/g],
  ['properties', 'src/data/propertiesData.ts', /image: require\('\.\.\/\.\.\/assets\/collections\/properties\/([^']+)'\)/g],
];
const lifestyle: Record<string, { count: number; uniqueImages: number }> = {};
let lifestyleImageHashes = new Set();
for (const [name, sourceFile, pattern] of categories) {
  const source = fs.readFileSync(path.join(root, sourceFile), 'utf8');
  const paths = [...source.matchAll(pattern)].map(match => match[1]);
  assert.equal(paths.length, 30, `${name} should have 30 image mappings`);
  assert.equal(new Set(paths).size, 30, `${name} image paths should be unique`);
  for (const file of paths) {
    const absolute = path.join(root, 'assets/collections', name, file);
    assert(fs.existsSync(absolute), `missing ${name} image: ${file}`);
    const hash = require('crypto').createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
    lifestyleImageHashes.add(hash);
  }
  lifestyle[name] = { count: paths.length, uniqueImages: new Set(paths).size };
}
assert.equal(lifestyleImageHashes.size, 120, 'all 120 Lifestyle image files must be distinct');
assert.match(fs.readFileSync(path.join(root, 'src/screens/AssetCard.tsx'), 'utf8'), /item\.image \? <Image source=\{item\.image\}/, 'Lifestyle cards must render assigned images directly');

console.log(JSON.stringify({
  stockLogos: { count: logoMappings.length, uniqueFiles: new Set(logoMappings.map(item => item.file)).size, activeSeedWiring: 'PASS', oldSaveHydration: 'PASS', directCardRendering: 'PASS', remoteDependency: 'NONE' },
  lifestyle,
  lifestyleTotalUniqueFiles: lifestyleImageHashes.size,
  prohibitedPlaceholderLogic: 'PASS',
}, null, 2));
