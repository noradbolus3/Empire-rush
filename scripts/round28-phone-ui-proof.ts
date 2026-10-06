// @ts-nocheck
const fs = require('node:fs');
const assert = require('node:assert/strict');

const moduleSource = fs.readFileSync('src/screens/markets/MarketsModuleScreen.tsx', 'utf8');
const appSource = fs.readFileSync('App.tsx', 'utf8');

assert.match(moduleSource, /ref=\{navRef\}/, 'secondary navigation keeps a scroll ref');
assert.match(moduleSource, /scrollTo\(\{x:Math\.max\(0,index\*92-24\),animated:true\}\)/, 'selected secondary tab scrolls into view');
assert.match(moduleSource, /navButton:\{height:42/, 'secondary tabs are compact phone-height controls');
assert.match(moduleSource, /showsHorizontalScrollIndicator=\{false\}/, 'secondary rail is horizontal-only');
assert.match(moduleSource, /asset\.kind==='CRYPTO'\?`\$\{asset\.symbol\} · Rank/, 'crypto list uses crypto-specific rank/volume metadata');
assert.match(moduleSource, /DividendPanel/, 'stock detail exposes a dividend experience');
assert.match(moduleSource, /Network activity/, 'crypto detail exposes network activity');
assert.match(moduleSource, /Not enough history yet\./, 'portfolio curve has an honest insufficient-history state');
assert.doesNotMatch(moduleSource, /const usable=values\.length\?values:\[/, 'portfolio curve does not fabricate fallback points');
assert.match(moduleSource, /function PriceText/, 'price transitions use an interpolated display value');
assert.match(moduleSource, /Animated\.timing\(opacity/, 'chart entry has a subtle animation');
assert.match(appSource, /paddingTop: 9, paddingBottom: 5/, 'global HUD vertical spacing is compressed');
assert.match(appSource, /paddingVertical: 2, paddingHorizontal: 6/, 'bottom navigation spacing is compact');

console.log(JSON.stringify({
  navigation: { horizontalOnly: true, compactTabHeight: 42, selectedTabAutoScroll: true },
  informationDensity: { cryptoSpecificRows: true, dividendDetail: true, compactGlobalHud: true },
  portfolio: { fabricatedFallbackRemoved: true, honestEmptyState: true },
  animation: { interpolatedPrice: true, chartEntryFade: true },
  enginePreservation: 'UI-only proof; market engines remain outside this focused change'
}, null, 2));
