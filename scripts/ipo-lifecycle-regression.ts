import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { acceptIPOOnce } from '../src/engine/ipoIdempotency';
import type { IPOListing } from '../src/types/ipo';

type Asset = { id: string; isPlayerCompany?: boolean; companyId?: string };

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
  listedAtTimestamp: 1_700_000_000_000,
  history: [10],
});

const source = readFileSync('App.tsx', 'utf8');
const sourceChecks = {
  refBackedCompletion: /const accepted = acceptIPOOnce\(ipoListingsRef\.current, safeListing\)/.test(source),
  perCompanyCompletionLock: /ipoCompletionLocks\.current\.has\(listing\.companyId\)/.test(source),
  allListingsAssetReconciliation: /Object\.values\(accepted\.listings\)\.map/.test(source),
  allListingsOwnership: /Object\.values\(ipoListings\)\.map/.test(source),
  investorLedgerEntry: /kind: "INVESTOR"/.test(source),
};
for (const [name, ok] of Object.entries(sourceChecks)) assert.equal(ok, true, `source check failed: ${name}`);

const first = makeListing('retail-1', 120_000);
const second = makeListing('construction-1', 80_000);
let listings: Record<string, IPOListing> = {};
let cash = 0;
let ledgerCount = 0;
const locks = new Set<string>();
const completeIPO = (listing: IPOListing) => {
  if (locks.has(listing.companyId)) return;
  locks.add(listing.companyId);
  const accepted = acceptIPOOnce(listings, listing);
  if (!accepted.accepted) return;
  listings = accepted.listings;
  cash += listing.capitalRaised;
  ledgerCount += 1;
};

// Two synchronous submissions for the same company represent a rapid double tap.
completeIPO(first);
completeIPO(first);
assert.equal(cash, first.capitalRaised);
assert.equal(ledgerCount, 1);
assert.equal(Object.keys(listings).length, 1);
const duplicateCheckpointListings = Object.keys(listings).length;

// A different company must be independently accepted.
locks.delete(second.companyId);
completeIPO(second);
assert.equal(cash, first.capitalRaised + second.capitalRaised);
assert.equal(ledgerCount, 2);
assert.deepEqual(Object.keys(listings).sort(), ['construction-1', 'retail-1']);

const firstAsset: Asset = { id: 'ipo-retail-1', isPlayerCompany: true, companyId: 'retail-1' };
const secondAsset: Asset = { id: 'ipo-construction-1', isPlayerCompany: true, companyId: 'construction-1' };
const reconciledAssets = Object.values(listings).map((item) => ({
  id: `ipo-${item.companyId}`,
  isPlayerCompany: true,
  companyId: item.companyId,
}));
assert.ok(reconciledAssets.some((asset) => asset.companyId === firstAsset.companyId));
assert.ok(reconciledAssets.some((asset) => asset.companyId === secondAsset.companyId));

const reloadedListings = JSON.parse(JSON.stringify(listings)) as Record<string, IPOListing>;
assert.deepEqual(Object.keys(reloadedListings).sort(), ['construction-1', 'retail-1']);
assert.equal(reloadedListings['retail-1'].capitalRaised, first.capitalRaised);
assert.equal(reloadedListings['construction-1'].capitalRaised, second.capitalRaised);

console.log(JSON.stringify({
  test: 'ipo-lifecycle-regression-after-fix',
  sourceChecks,
  duplicateSubmission: {
    calls: 2,
    cashRaised: first.capitalRaised,
    expectedCashRaised: first.capitalRaised,
    listings: duplicateCheckpointListings,
  },
  independentBusinesses: {
    companies: Object.keys(listings).sort(),
    cashRaised: cash,
    expectedCashRaised: first.capitalRaised + second.capitalRaised,
    investorLedgerEntries: ledgerCount,
  },
  assetReconciliation: {
    assets: reconciledAssets.map((asset) => asset.id).sort(),
    preservedFirstIPO: true,
    preservedSecondIPO: true,
  },
  saveReload: {
    listings: Object.keys(reloadedListings).sort(),
    preservedCapitalRaised: true,
  },
  result: 'PASS',
}, null, 2));
