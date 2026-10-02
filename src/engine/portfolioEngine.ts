import { Asset, Holding } from '../types/marketAsset';
import { TradeRecord } from '../types/market';

export type PortfolioSummary = {
  totalInvested: number;
  currentValue: number;
  unrealizedPnl: number;
  realizedPnl: number;
};

export function normalizeHoldings(holdings: Record<string, Partial<Holding>> | undefined, assets: Asset[]): Record<string, Holding> {
  const next: Record<string, Holding> = {};
  for (const [assetId, raw] of Object.entries(holdings || {})) {
    const asset = assets.find(item => item.id === assetId);
    const shares = Number.isFinite(raw?.shares) ? Math.max(0, Number(raw?.shares)) : 0;
    if (!asset || shares <= 0) continue;
    const fallbackPrice = Number.isFinite(asset.price) ? asset.price : 0;
    const avgPrice = Number.isFinite(raw?.avgPrice) && Number(raw?.avgPrice) > 0 ? Number(raw?.avgPrice) : fallbackPrice;
    const realizedPnl = Number.isFinite(raw?.realizedPnl) ? Number(raw?.realizedPnl) : Number(raw?.realized) || 0;
    next[assetId] = { shares, avgPrice, realized: realizedPnl, realizedPnl };
  }
  return next;
}

export function buyHolding(current: Holding | undefined, quantity: number, price: number): Holding {
  const existing = current && current.shares > 0 ? current : { shares: 0, avgPrice: 0, realized: 0, realizedPnl: 0 };
  const nextShares = existing.shares + quantity;
  const avgPrice = nextShares > 0 ? (existing.avgPrice * existing.shares + price * quantity) / nextShares : 0;
  return { ...existing, shares: Number(nextShares.toFixed(8)), avgPrice: Number(avgPrice.toFixed(8)), realized: existing.realizedPnl ?? existing.realized ?? 0, realizedPnl: existing.realizedPnl ?? existing.realized ?? 0 };
}

export function sellHolding(current: Holding, quantity: number, price: number): { holding: Holding; realizedPnl: number } {
  const realizedPnl = Number(((price - current.avgPrice) * quantity).toFixed(2));
  const remaining = Number(Math.max(0, current.shares - quantity).toFixed(8));
  const totalRealized = Number(((current.realizedPnl ?? current.realized ?? 0) + realizedPnl).toFixed(2));
  return { holding: { ...current, shares: remaining, avgPrice: remaining > 0 ? current.avgPrice : 0, realized: totalRealized, realizedPnl: totalRealized }, realizedPnl };
}

export function holdingUnrealizedPnl(holding: Holding | undefined, price: number): number {
  if (!holding) return 0;
  return Number(((price - holding.avgPrice) * holding.shares).toFixed(2));
}

export function holdingInvested(holding: Holding | undefined): number {
  return Number(((holding?.avgPrice || 0) * (holding?.shares || 0)).toFixed(2));
}

export function holdingCurrentValue(holding: Holding | undefined, price: number): number {
  return Number(((holding?.shares || 0) * price).toFixed(2));
}

export function portfolioSummary(assets: Asset[], holdings: Record<string, Holding>, trades: TradeRecord[] = []): PortfolioSummary {
  const totalInvested = Number(Object.entries(holdings).reduce((sum, [assetId, holding]) => sum + holdingInvested(holding), 0).toFixed(2));
  const currentValue = Number(Object.entries(holdings).reduce((sum, [assetId, holding]) => sum + holdingCurrentValue(holding, assets.find(asset => asset.id === assetId)?.price || 0), 0).toFixed(2));
  const unrealizedPnl = Number(Object.entries(holdings).reduce((sum, [assetId, holding]) => sum + holdingUnrealizedPnl(holding, assets.find(asset => asset.id === assetId)?.price || 0), 0).toFixed(2));
  const realizedPnl = Number(Object.values(holdings).reduce((sum, holding) => sum + (holding.realizedPnl ?? holding.realized ?? 0), 0).toFixed(2));
  return { totalInvested, currentValue, unrealizedPnl, realizedPnl };
}

export function capTradeHistory(records: TradeRecord[], limit = 100): TradeRecord[] {
  return records.slice(-limit);
}
