declare const require: (name: string) => any;
const assert = require('assert').strict;
const fs = require('fs');

const moduleSource = fs.readFileSync('src/screens/markets/MarketsModuleScreen.tsx', 'utf8');
const appSource = fs.readFileSync('App.tsx', 'utf8');

assert.match(moduleSource, /channelSummary=useMemo\(\(\)=>portfolioSummary\(channelAssets,channelHoldings,filteredTrades\)/);
assert.match(moduleSource, /summary=\{channelSummary\}/);
assert.match(moduleSource, /channelAllocation=useMemo\(\(\)=>portfolioAllocation\(channelAssets,channelHoldings,cash\)/);
assert.match(moduleSource, /allocation=\{channelAllocation\}/);
assert.match(moduleSource, /muted:\{color:C\.muted/);
assert.match(moduleSource, /indexStrip:\{[^}]*flexWrap:'wrap'/);
assert.match(moduleSource, /metric:\{[^}]*minWidth:'46%'/);
assert.match(moduleSource, /height=\{110\} viewBox="0 0 320 110"/);
assert.match(appSource, /paddingVertical: 4, paddingHorizontal: 6/);
assert.match(appSource, /width: 46, height: 46, borderRadius: 23, marginTop: -10/);
assert.match(appSource, /content: \{ paddingHorizontal: 18, paddingBottom: 82 \}/);

console.log(JSON.stringify({
  ok: true,
  fixes: {
    separateStocksCryptoPortfolio: true,
    readableMutedText: true,
    wrappedOverviewMetrics: true,
    compactChart: true,
    compactBottomNavigation: true,
  },
}, null, 2));
