import assert from "node:assert/strict";
import { normalizeIPOState } from "../src/engine/ipoState";
import type { IPOListing } from "../src/types/ipo";

const listing = (companyId: string, timestamp: number): IPOListing => ({
  companyId,
  companyName: companyId,
  ticker: companyId.slice(0, 3).toUpperCase(),
  sector: "Retail",
  sharesOutstanding: 1_000_000,
  founderShares: 800_000,
  publicShares: 200_000,
  ipoPrice: 10,
  currentPrice: 10,
  capitalRaised: 100_000,
  founderOwnershipFraction: 0.8,
  valuationAtIPO: 1_000_000,
  stage: "public",
  listedAtTimestamp: timestamp,
  history: [10],
});

const stale = listing("stale-company", 1);
const current = listing("current-company", 2);
const second = listing("second-company", 3);

const legacyOnly = normalizeIPOState(stale, undefined);
assert.deepEqual(Object.keys(legacyOnly.listings), ["stale-company"]);
assert.equal(legacyOnly.current?.companyId, "stale-company");

const collectionOnly = normalizeIPOState(undefined, {
  "current-company": current,
  "second-company": second,
});
assert.deepEqual(Object.keys(collectionOnly.listings).sort(), ["current-company", "second-company"]);
assert.equal(collectionOnly.current?.companyId, "current-company");

const staleSingleton = normalizeIPOState(stale, {
  "current-company": current,
  "second-company": second,
});
assert.deepEqual(Object.keys(staleSingleton.listings).sort(), ["current-company", "second-company"]);
assert.equal(staleSingleton.current?.companyId, "current-company");
assert.notEqual(staleSingleton.current?.companyId, stale.companyId);

const malformed = normalizeIPOState(stale, {
  "current-company": current,
  broken: { companyId: "broken", stage: "public" },
  wrongKey: second,
});
assert.deepEqual(Object.keys(malformed.listings), ["current-company"]);
assert.equal(malformed.current?.companyId, "current-company");

console.log(JSON.stringify({
  test: "ipo-state-regression",
  legacyOnly: legacyOnly.current?.companyId,
  collectionOnly: Object.keys(collectionOnly.listings).length,
  staleSingletonResolvedTo: staleSingleton.current?.companyId,
  malformedEntriesDropped: 2,
  result: "PASS",
}, null, 2));
