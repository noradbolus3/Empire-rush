import { LimitOrder, PortfolioPoint } from '../types/market';

export type MarketSector = 'TECH' | 'ENERGY' | 'PHARMA' | 'MOBILITY' | 'BANKING' | 'RETAIL' | 'CRYPTO';
export type MarketAsset = { id: string; symbol: string; name: string; kind: 'STOCK' | 'CRYPTO'; price: number; change: number; dividend: number; volatility: number; history: number[]; sector?: MarketSector; maxShares?: number; isPlayerCompany?: boolean };
export type MarketEvent = { id: string; headline: string; sector: MarketSector | 'ALL'; shock: number };

export const MARKET_EVENTS: MarketEvent[] = [
  { id: 'fed-rate', headline: 'Fed holds rates higher for longer: growth stocks slide 6%', sector: 'TECH', shock: -0.06 },
  { id: 'ev-credit', headline: 'EV tax credit extended: U.S. mobility demand accelerates', sector: 'MOBILITY', shock: 0.08 },
  { id: 'energy-grid', headline: 'Grid modernization bill passes: clean energy rallies 7%', sector: 'ENERGY', shock: 0.07 },
  { id: 'pharma-approval', headline: 'FDA fast-track approvals lift biotech confidence', sector: 'PHARMA', shock: 0.06 },
  { id: 'bank-stress', headline: 'Regional bank stress returns: financials reprice sharply', sector: 'BANKING', shock: -0.07 },
  { id: 'retail-holiday', headline: 'Holiday spending beats estimates: consumer names rally', sector: 'RETAIL', shock: 0.05 },
  { id: 'crypto-bull', headline: 'Digital asset inflows hit a new high: crypto enters a bull run', sector: 'CRYPTO', shock: 0.1 },
  { id: 'market-risk', headline: 'Risk-off session: investors rotate into cash across sectors', sector: 'ALL', shock: -0.035 },
];

export function applyMarketEvent<T extends MarketAsset>(assets: T[], event: MarketEvent): T[] {
  return assets.map(asset => {
    const matches = event.sector === 'ALL' || asset.kind === 'CRYPTO' && event.sector === 'CRYPTO' || asset.sector === event.sector;
    if (!matches) return asset;
    const price = Math.max(asset.kind === 'CRYPTO' ? 1 : 5, asset.price * (1 + event.shock));
    return { ...asset, price, change: event.shock * 100, history: [...asset.history.slice(-14), price] };
  });
}

export function advanceMarketTick<T extends MarketAsset>(assets: T[], tick: number): { assets: T[]; event: MarketEvent | null } {
  const event = tick > 0 && tick % 15 === 0 ? MARKET_EVENTS[(tick / 15 - 1) % MARKET_EVENTS.length] : null;
  const moved = assets.map(asset => {
    const wave = Math.sin(tick * 0.71 + asset.id.length) * asset.volatility * 0.45;
    const drift = (asset.kind === 'CRYPTO' ? 0.0004 : 0.00015) + wave;
    const price = Math.max(asset.kind === 'CRYPTO' ? 1 : 5, asset.price * (1 + drift));
    return { ...asset, price, change: drift * 100, history: [...asset.history.slice(-14), price] };
  });
  return { assets: event ? applyMarketEvent(moved, event) : moved, event };
}

export function calculateQuarterlyDividends<T extends MarketAsset>(assets: T[], holdings: Record<string, { shares: number }>): number {
  return Number(assets.reduce((sum, asset) => sum + (holdings[asset.id]?.shares || 0) * asset.price * (asset.dividend / 100) / 4, 0).toFixed(2));
}

export function quarterKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getUTCFullYear()}-Q${Math.floor(date.getUTCMonth() / 3) + 1}`;
}

export function matchLimitOrders<T extends MarketAsset>(assets: T[], orders: LimitOrder[], gameTimestamp: number): { orders: LimitOrder[]; fills: LimitOrder[] } {
  const fills: LimitOrder[] = [];
  const nextOrders = orders.map(order => {
    if (order.status !== 'OPEN') return order;
    const asset = assets.find(item => item.id === order.assetId);
    if (!asset) return order;
    const canFill = order.side === 'BUY' ? asset.price <= order.limitPrice : asset.price >= order.limitPrice;
    if (!canFill) return order;
    const filled = { ...order, status: 'FILLED' as const, filledAt: gameTimestamp, filledPrice: asset.price };
    fills.push(filled);
    return filled;
  });
  return { orders: nextOrders, fills };
}

export function portfolioValue<T extends MarketAsset>(assets: T[], holdings: Record<string, { shares: number }>): number {
  return Number(Object.entries(holdings).reduce((sum, [id, holding]) => sum + holding.shares * (assets.find(asset => asset.id === id)?.price || 0), 0).toFixed(2));
}

export function appendPortfolioPoint(points: PortfolioPoint[], timestamp: number, value: number): PortfolioPoint[] {
  const next = [...points.filter(point => point.timestamp !== timestamp), { timestamp, value }];
  return next.slice(-48);
}
