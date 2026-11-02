import { capIPOProceeds, listingToAsset } from './ipoEngine';
import { acceptIPOOnce, type IPOListingMap } from './ipoIdempotency';
import type { BankLedgerEntry } from '../types/bank';
import type { IPOListing } from '../types/ipo';
import type { Asset } from '../types/marketAsset';

export type IPOCompletionInput = {
  listing: IPOListing;
  listings: IPOListingMap;
  assets: Asset[];
  cash: number;
  netWorth: number;
};

export type IPOCompletionResult =
  | { accepted: false; reason: 'already-public'; listings: IPOListingMap; cash: number; assets: Asset[] }
  | {
      accepted: true;
      listing: IPOListing;
      listings: IPOListingMap;
      cash: number;
      assets: Asset[];
      ledgerEntry: BankLedgerEntry;
    };

/**
 * Authoritative one-time IPO transaction. The App handler supplies its ref-backed
 * listing map, then commits every returned state slice and ledger entry together.
 */
export function completeIPOTransaction(input: IPOCompletionInput): IPOCompletionResult {
  const safeListing = capIPOProceeds(input.listing, input.netWorth);
  const accepted = acceptIPOOnce(input.listings, safeListing);
  if (!accepted.accepted) {
    return {
      accepted: false,
      reason: 'already-public',
      listings: input.listings,
      cash: input.cash,
      assets: input.assets,
    };
  }

  const assets = [
    ...input.assets.filter((asset) => !asset.isPlayerCompany),
    ...Object.values(accepted.listings).map((item) => listingToAsset(item) as Asset),
  ];
  const ledgerEntry: BankLedgerEntry = {
    id: `ledger-ipo-${safeListing.companyId}-${safeListing.listedAtTimestamp}`,
    kind: 'INVESTOR',
    label: `${safeListing.companyName} IPO proceeds`,
    amount: safeListing.capitalRaised,
    timestamp: safeListing.listedAtTimestamp,
    detail: 'Minority public offering proceeds',
  };

  return {
    accepted: true,
    listing: safeListing,
    listings: accepted.listings,
    cash: Math.min(Number.MAX_SAFE_INTEGER, input.cash + safeListing.capitalRaised),
    assets,
    ledgerEntry,
  };
}
