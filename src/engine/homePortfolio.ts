import type { CanonicalBusiness } from "./canonicalBusinessRegistry";

/**
 * Home must display the same owned-business records used for canonical counts.
 * The registry is already deduplicated, so this selector must not merge in the
 * legacy generic businesses array or synthesize fallback rows.
 */
export function selectHomePortfolioBusinesses(
  records: readonly CanonicalBusiness[],
): CanonicalBusiness[] {
  return records.filter((record) => record.owned);
}
