import type { IPOListing } from "../types/ipo";

export type IPOListingMap = Record<string, IPOListing>;

export function acceptIPOOnce(
  listings: IPOListingMap,
  listing: IPOListing,
): { accepted: boolean; listings: IPOListingMap } {
  const existing = listings[listing.companyId];
  if (existing?.stage === "public") {
    return { accepted: false, listings };
  }
  return {
    accepted: true,
    listings: { ...listings, [listing.companyId]: listing },
  };
}
