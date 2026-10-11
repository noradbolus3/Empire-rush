import { Asset, Holding } from "../types/marketAsset";
import { PortfolioPoint, TradeRecord } from "../types/market";

export type PortfolioSummary = {
  totalInvested: number;
  currentValue: number;
  unrealizedPnl: number;
  realizedPnl: number;
};

export type PortfolioRange = "1D" | "1W" | "1M";
export type PortfolioAllocation = {
  id: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
};

export function portfolioRangePoints(
  points: PortfolioPoint[],
  range: PortfolioRange,
  now: number,
): PortfolioPoint[] {
  const duration =
    range === "1D"
      ? 24 * 60 * 60 * 1000
      : range === "1W"
        ? 7 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000;
  return points.filter((point) => point.timestamp >= now - duration);
}

export function portfolioAllocation(
  assets: Asset[],
  holdings: Record<string, Holding>,
  cash: number,
): PortfolioAllocation[] {
  const groups = new Map<string, number>();
  for (const [assetId, holding] of Object.entries(holdings)) {
    const asset = assets.find((item) => item.id === assetId);
    if (!asset || holding.shares <= 0) continue;
    const key = asset.sector || asset.kind;
    groups.set(
      key,
      (groups.get(key) || 0) + holdingCurrentValue(holding, asset.price),
    );
  }
  if (cash > 0) groups.set("CASH", cash);
  const total = [...groups.values()].reduce((sum, value) => sum + value, 0);
  const colors = [
    "#61E8FF",
    "#16E98A",
    "#FFC928",
    "#FF6D62",
    "#B78CFF",
    "#8FB5A4",
  ];
  return [...groups.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], index) => ({
      id: label,
      label,
      value: Number(value.toFixed(2)),
      percentage: total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0,
      color: colors[index % colors.length],
    }));
}

export function normalizeHoldings(
  holdings: Record<string, Partial<Holding>> | undefined,
  assets: Asset[],
): Record<string, Holding> {
  const next: Record<string, Holding> = {};
  for (const [assetId, raw] of Object.entries(holdings || {})) {
    const asset = assets.find((item) => item.id === assetId);
    const shares = Number.isFinite(raw?.shares)
      ? Math.max(0, Number(raw?.shares))
      : 0;
    if (!asset || shares <= 0) continue;
    const fallbackPrice = Number.isFinite(asset.price) ? asset.price : 0;
    const avgPrice =
      Number.isFinite(raw?.avgPrice) && Number(raw?.avgPrice) > 0
        ? Number(raw?.avgPrice)
        : fallbackPrice;
    const realizedPnl = Number.isFinite(raw?.realizedPnl)
      ? Number(raw?.realizedPnl)
      : Number(raw?.realized) || 0;
    next[assetId] = {
      shares,
      avgPrice,
      realized: realizedPnl,
      realizedPnl,
      acquiredAtMs: Number((raw as any)?.acquiredAtMs) || undefined,
    };
  }
  return next;
}

export function buyHolding(
  current: Holding | undefined,
  quantity: number,
  price: number,
  acquiredAtMs = Date.now(),
): Holding {
  const existing =
    current && current.shares > 0
      ? current
      : { shares: 0, avgPrice: 0, realized: 0, realizedPnl: 0 };
  const nextShares = existing.shares + quantity;
  const avgPrice =
    nextShares > 0
      ? (existing.avgPrice * existing.shares + price * quantity) / nextShares
      : 0;
  return {
    ...existing,
    acquiredAtMs: existing.acquiredAtMs || acquiredAtMs,
    shares: Number(nextShares.toFixed(8)),
    avgPrice: Number(avgPrice.toFixed(8)),
    realized: existing.realizedPnl ?? existing.realized ?? 0,
    realizedPnl: existing.realizedPnl ?? existing.realized ?? 0,
  };
}

export function sellHolding(
  current: Holding,
  quantity: number,
  price: number,
): { holding: Holding; realizedPnl: number } {
  const realizedPnl = Number(
    ((price - current.avgPrice) * quantity).toFixed(2),
  );
  const remaining = Number(Math.max(0, current.shares - quantity).toFixed(8));
  const totalRealized = Number(
    ((current.realizedPnl ?? current.realized ?? 0) + realizedPnl).toFixed(2),
  );
  return {
    holding: {
      ...current,
      shares: remaining,
      avgPrice: remaining > 0 ? current.avgPrice : 0,
      realized: totalRealized,
      realizedPnl: totalRealized,
    },
    realizedPnl,
  };
}

export function holdingUnrealizedPnl(
  holding: Holding | undefined,
  price: number,
): number {
  if (!holding) return 0;
  return Number(((price - holding.avgPrice) * holding.shares).toFixed(2));
}

export function holdingInvested(holding: Holding | undefined): number {
  return Number(((holding?.avgPrice || 0) * (holding?.shares || 0)).toFixed(2));
}

export function holdingCurrentValue(
  holding: Holding | undefined,
  price: number,
): number {
  return Number(((holding?.shares || 0) * price).toFixed(2));
}

export function portfolioSummary(
  assets: Asset[],
  holdings: Record<string, Holding>,
  trades: TradeRecord[] = [],
): PortfolioSummary {
  const totalInvested = Number(
    Object.entries(holdings)
      .reduce((sum, [assetId, holding]) => sum + holdingInvested(holding), 0)
      .toFixed(2),
  );
  const currentValue = Number(
    Object.entries(holdings)
      .reduce(
        (sum, [assetId, holding]) =>
          sum +
          holdingCurrentValue(
            holding,
            assets.find((asset) => asset.id === assetId)?.price || 0,
          ),
        0,
      )
      .toFixed(2),
  );
  const unrealizedPnl = Number(
    Object.entries(holdings)
      .reduce(
        (sum, [assetId, holding]) =>
          sum +
          holdingUnrealizedPnl(
            holding,
            assets.find((asset) => asset.id === assetId)?.price || 0,
          ),
        0,
      )
      .toFixed(2),
  );
  const realizedPnl = Number(
    Object.values(holdings)
      .reduce(
        (sum, holding) => sum + (holding.realizedPnl ?? holding.realized ?? 0),
        0,
      )
      .toFixed(2),
  );
  return { totalInvested, currentValue, unrealizedPnl, realizedPnl };
}

export function capTradeHistory(
  records: TradeRecord[],
  limit = 100,
): TradeRecord[] {
  return records.slice(-limit);
}
