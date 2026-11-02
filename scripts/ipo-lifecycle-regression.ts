import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { completeIPOTransaction } from '../src/engine/ipoCompletion';
import type { IPOListing } from '../src/types/ipo';
import type { Asset } from '../src/types/marketAsset';

type AppFlowState = {
  cash: number;
  listings: Record<string, IPOListing>;
  assets: Asset[];
  ledger: Array<{ id: string; kind: string; amount: number }>;
};

const makeListing = (companyId: string, capitalRaised: number): IPOListing => ({
  companyId,
  companyName: companyId === 'retail-1' ? 'Copper & Bloom Market' : 'Northline Construction',
  ticker: companyId === 'retail-1' ? 'CBM' : 'NLC',
  sector: companyId === 'retail-1' ? 'Retail' : 'Construction_Mega',
  sharesOutstanding: 1_000_000,
  founderShares: 800_000,
  publicShares: 200_000,
  ipoPrice: 10,
  currentPrice: 10,
  capitalRaised,
  founderOwnershipFraction: 0.8,
  valuationAtIPO: 10_000_000,
  stage: 'public',
  listedAtTimestamp: companyId === 'retail-1' ? 1_700_000_000_000 : 1_700_000_000_001,
  history: [10],
});

const appSource = readFileSync('App.tsx', 'utf8');
const businessScreenSource = readFileSync('src/screens/BusinessScreen.tsx', 'utf8');
const sourceChecks = {
  appImportsProductionFunction: /import \{ completeIPOTransaction \} from "\.\/src\/engine\/ipoCompletion"/.test(appSource),
  appInvokesProductionFunction: /const transaction = completeIPOTransaction\(\{/.test(appSource),
  appCommitsReturnedAssets: /setAssets\(transaction\.assets\)/.test(appSource),
  appCommitsReturnedLedger: /postLedger\(transaction\.ledgerEntry\)/.test(appSource),
  appPassesIPOCollection: /ipoListings=\{ipoListings\}/.test(appSource),
  businessUISelectsCurrentListing: /ipoListings\?\.\[selected\.id\]/.test(businessScreenSource),
};
for (const [name, ok] of Object.entries(sourceChecks)) assert.equal(ok, true, `App integration check failed: ${name}`);

function createAppFlow(initial: AppFlowState) {
  const state = initial;
  const locks = new Set<string>();
  const completeIPO = (listing: IPOListing) => {
    if (locks.has(listing.companyId)) return false;
    locks.add(listing.companyId);
    const transaction = completeIPOTransaction({
      listing,
      listings: state.listings,
      assets: state.assets,
      cash: state.cash,
      netWorth: 50_000_000,
    });
    if (!transaction.accepted) return false;
    state.listings = transaction.listings;
    state.assets = transaction.assets;
    state.cash = transaction.cash;
    state.ledger.push(transaction.ledgerEntry);
    return true;
  };
  return { state, completeIPO, locks };
}

const first = makeListing('retail-1', 120_000);
const second = makeListing('construction-1', 80_000);
const flow = createAppFlow({ cash: 500_000, listings: {}, assets: [], ledger: [] });

// Actual App-style handler: two same-company submissions before a React render commit.
assert.equal(flow.completeIPO(first), true);
assert.equal(flow.completeIPO(first), false);
assert.equal(flow.state.cash, 620_000);
assert.equal(flow.state.ledger.length, 1);
assert.deepEqual(Object.keys(flow.state.listings), ['retail-1']);

// A distinct company remains independently eligible.
flow.locks.delete(second.companyId);
assert.equal(flow.completeIPO(second), true);
assert.equal(flow.state.cash, 700_000);
assert.equal(flow.state.ledger.length, 2);
assert.deepEqual(Object.keys(flow.state.listings).sort(), ['construction-1', 'retail-1']);
assert.deepEqual(flow.state.assets.map((asset) => asset.id).sort(), ['ipo-construction-1', 'ipo-retail-1']);

// Retry/failure path: already-public rejection must not mutate any financial slice.
const beforeRetry = JSON.stringify(flow.state);
flow.locks.delete(first.companyId);
assert.equal(flow.completeIPO(first), false);
assert.equal(JSON.stringify(flow.state), beforeRetry);

// Save/reload uses the same persisted collection shape.
const reloaded = JSON.parse(JSON.stringify(flow.state)) as AppFlowState;
assert.deepEqual(Object.keys(reloaded.listings).sort(), ['construction-1', 'retail-1']);
assert.equal(reloaded.cash, 700_000);
assert.equal(reloaded.ledger.length, 2);
assert.deepEqual(reloaded.assets.map((asset) => asset.id).sort(), ['ipo-construction-1', 'ipo-retail-1']);

// Direct production-function failure result is also non-mutating for the caller.
const rejected = completeIPOTransaction({
  listing: first,
  listings: reloaded.listings,
  assets: reloaded.assets,
  cash: reloaded.cash,
  netWorth: 50_000_000,
});
assert.equal(rejected.accepted, false);
assert.equal(rejected.cash, reloaded.cash);
assert.deepEqual(Object.keys(rejected.listings).sort(), ['construction-1', 'retail-1']);

console.log(JSON.stringify({
  test: 'ipo-lifecycle-regression-production-function',
  sourceChecks,
  productionFunction: 'src/engine/ipoCompletion.ts::completeIPOTransaction',
  duplicateSubmission: {
    calls: 2,
    firstAccepted: true,
    secondAccepted: false,
    cashAfter: 620_000,
    ledgerEntries: 1,
  },
  independentBusinesses: {
    listings: Object.keys(flow.state.listings).sort(),
    cashAfter: flow.state.cash,
    ledgerEntries: flow.state.ledger.length,
    assets: flow.state.assets.map((asset) => asset.id).sort(),
  },
  retryFailure: {
    accepted: false,
    stateUnchanged: true,
  },
  saveReload: {
    listings: Object.keys(reloaded.listings).sort(),
    cash: reloaded.cash,
    ledgerEntries: reloaded.ledger.length,
    assets: reloaded.assets.map((asset) => asset.id).sort(),
  },
  result: 'PASS',
}, null, 2));
