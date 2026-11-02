import type { IPOListing } from "../types/ipo";
import type { IPOListingMap } from "./ipoIdempotency";

function isIPOListing(value: unknown): value is IPOListing {
  if (!value || typeof value !== "object") return false;
  const listing = value as Partial<IPOListing>;
  return (
    typeof listing.companyId === "string" &&
    listing.companyId.length > 0 &&
    typeof listing.companyName === "string" &&
    typeof listing.ticker === "string" &&
    (listing.stage === "private" || listing.stage === "public") &&
    Number.isFinite(listing.listedAtTimestamp)
  );
}

export type NormalizedIPOState = {
  listings: IPOListingMap;
  current: IPOListing | null;
};

/**
 * The collection is authoritative because multiple businesses can be public.
 * The singleton remains a compatibility projection for legacy consumers.
 */
export function normalizeIPOState(
  legacyListing: unknown,
  rawListings: unknown,
): NormalizedIPOState {
  const collection: IPOListingMap = {};
  if (rawListings && typeof rawListings === "object" && !Array.isArray(rawListings)) {
    for (const [key, value] of Object.entries(rawListings)) {
      if (isIPOListing(value) && key === value.companyId) {
        collection[key] = value;
      }
    }
  }

  const listings = Object.keys(collection).length
    ? collection
    : isIPOListing(legacyListing)
      ? { [legacyListing.companyId]: legacyListing }
      : {};
  const current =
    isIPOListing(legacyListing) && listings[legacyListing.companyId]
      ? listings[legacyListing.companyId]
      : Object.values(listings)[0] ?? null;

  return { listings, current };
}
