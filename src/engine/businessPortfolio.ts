import type { BusinessEntity } from "../types/business";
import type { CanonicalBusiness } from "./canonicalBusinessRegistry";
import { getBusinessDisplayMeta } from "../data/businessDisplayCatalog";
import {
  BUSINESS_ROUTE_CATALOG,
  getBusinessRouteById,
  getBusinessRouteByKind,
} from "../screens/business/businessRouteCatalog";

export type PortfolioStatus = "owned" | "available" | "locked";

/**
 * Resolve the legacy generic record that represents a specialized route's
 * shadow, when one exists. The specialized route remains the authoritative
 * record once its domain state is owned.
 */
export function sourceBusinessForPortfolioRecord(
  record: Pick<CanonicalBusiness, "id" | "kind">,
  businesses: readonly BusinessEntity[],
): BusinessEntity | null {
  if (record.kind === "generic") {
    return businesses.find((item) => item.id === record.id) ?? null;
  }
  const route = getBusinessRouteByKind(record.kind);
  return (
    route.stableIds
      .map((id) => businesses.find((item) => item.id === id) ?? null)
      .find((item): item is BusinessEntity => Boolean(item)) ?? null
  );
}

/**
 * Build the single UI portfolio from canonical records. Generic records whose
 * IDs are known specialized shadows are suppressed and represented by exactly
 * one specialized route row, preventing duplicate ownership/cashflow cards.
 */
export function buildUnifiedBusinessPortfolio(
  registry: readonly CanonicalBusiness[],
  businesses: readonly BusinessEntity[],
): CanonicalBusiness[] {
  const rows = registry.filter((record) => {
    if (record.source === "specialized-state") return true;
    const route = getBusinessRouteById(record.id);
    return !route || route.kind === "generic";
  });

  for (const route of BUSINESS_ROUTE_CATALOG) {
    if (route.kind === "generic") continue;
    if (rows.some((record) => record.kind === route.kind)) continue;
    const shadow = registry.find(
      (record) =>
        record.source === "generic-state" && route.stableIds.includes(record.id),
    );
    const source = route.stableIds
      .map((id) => businesses.find((item) => item.id === id) ?? null)
      .find((item): item is BusinessEntity => Boolean(item));
    const display = getBusinessDisplayMeta(route.kind);
    rows.push({
      id: shadow?.id ?? source?.id ?? route.routeId,
      name: shadow?.name ?? source?.name ?? display.shortLabel,
      kind: route.kind,
      owned: shadow?.owned ?? false,
      operating: shadow?.operating ?? false,
      hourlyRevenue: shadow?.hourlyRevenue ?? 0,
      hourlyExpenses: shadow?.hourlyExpenses ?? 0,
      hourlyNet: shadow?.hourlyNet ?? 0,
      pendingSettlementAmount: shadow?.pendingSettlementAmount ?? 0,
      assetValue: Math.max(0, shadow?.assetValue ?? source?.acquisitionCost ?? display.charterCost),
      consolidatesOtherBusinesses: route.kind === "holding",
      source: "specialized-state",
    });
  }

  return rows;
}

export function portfolioStatus(
  record: Pick<CanonicalBusiness, "id" | "kind" | "owned">,
  businesses: readonly BusinessEntity[],
  netWorth: number,
): PortfolioStatus {
  if (record.owned) return "owned";
  const source = sourceBusinessForPortfolioRecord(record, businesses);
  if (source && !(source.isUnlocked || netWorth >= source.unlockNetWorthRequired)) {
    return "locked";
  }
  return "available";
}

export function portfolioUnlockShortfall(
  record: Pick<CanonicalBusiness, "id" | "kind">,
  businesses: readonly BusinessEntity[],
  netWorth: number,
): number {
  const source = sourceBusinessForPortfolioRecord(record, businesses);
  return source ? Math.max(0, source.unlockNetWorthRequired - netWorth) : 0;
}
