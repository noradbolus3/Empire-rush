import { LimitOrder, PortfolioPoint } from '../types/market';

export type MarketSector = 'TECH' | 'ENERGY' | 'PHARMA' | 'MOBILITY' | 'BANKING' | 'RETAIL' | 'CRYPTO';
export type MarketAsset = { id: string; symbol: string; name: string; kind: 'STOCK' | 'CRYPTO'; price: number; change: number; dividend: number; volatility: number; history: number[]; sector?: MarketSector; maxShares?: number; isPlayerCompany?: boolean };
export type MarketEvent = { id: string; headline: string; sector: MarketSector | 'ALL'; shock: number };
export type MarketPulseSector = { sector: MarketSector; trendPct: number; positiveAssets: number; assetCount: number };
export type MarketPulse = { direction: 'BULLISH' | 'BEARISH' | 'MIXED'; averageTrendPct: number; positiveBreadthPct: number; sectors: MarketPulseSector[] };

export function recentAssetTrend(asset: Pick<MarketAsset, 'history' | 'change'>): number {
  const points = asset.history.slice(-6);
  if (points.length < 2 || points[0] <= 0) return Number(asset.change.toFixed(2));
  return Number((((points[points.length - 1] - points[0]) / points[0]) * 100).toFixed(2));
}

export function calculateMarketPulse<T extends MarketAsset>(assets: T[]): MarketPulse {
  const tracked = assets.filter(asset => asset.history.length > 0);
  if (!tracked.length) return { direction: 'MIXED', averageTrendPct: 0, positiveBreadthPct: 0, sectors: [] };
  const trends = tracked.map(asset => recentAssetTrend(asset));
  const averageTrendPct = Number((trends.reduce((sum, trend) => sum + trend, 0) / trends.length).toFixed(2));
  const positiveBreadthPct = Number(((trends.filter(trend => trend > 0).length / trends.length) * 100).toFixed(1));
  const direction = positiveBreadthPct >= 60 && averageTrendPct > 0 ? 'BULLISH' : positiveBreadthPct <= 40 && averageTrendPct < 0 ? 'BEARISH' : 'MIXED';
  const sectors = [...new Set(tracked.map(asset => asset.sector).filter(Boolean) as MarketSector[])].map(sector => {
    const sectorAssets = tracked.filter(asset => asset.sector === sector);
    const sectorTrends = sectorAssets.map(asset => recentAssetTrend(asset));
    return { sector, trendPct: Number((sectorTrends.reduce((sum, trend) => sum + trend, 0) / sectorTrends.length).toFixed(2)), positiveAssets: sectorTrends.filter(trend => trend > 0).length, assetCount: sectorAssets.length };
  }).sort((a, b) => b.trendPct - a.trendPct);
  return { direction, averageTrendPct, positiveBreadthPct, sectors };
}


export function createSeededHistory(seed: string, price: number, volatility: number, length = 18): number[] {
  let state = Array.from(seed).reduce((value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, 2166136261);
  let current = price * (0.94 + (state % 7) * 0.01);
  const values: number[] = [];
  for (let index = 0; index < length; index += 1) {
    state = (1664525 * state + 1013904223) >>> 0;
    const random = state / 4294967296;
    const drift = (random - 0.5) * volatility * 1.8 + (index % 5 === 0 ? 0.002 : -0.0005);
    current = Math.max(price * 0.72, Math.min(price * 1.12, current * (1 + drift)));
    values.push(Number(current.toFixed(2)));
  }
  values[values.length - 1] = Number(price.toFixed(2));
  return values;
}


export function normalizeAssetHistories<T extends MarketAsset>(assets: T[]): T[] {
  return assets.map(asset => ({ ...asset, history: asset.history.length < 2 || new Set(asset.history.map(value => value.toFixed(4))).size < Math.min(4, asset.history.length) ? createSeededHistory(`${asset.id}:${asset.symbol}:${asset.name}`, asset.price, asset.volatility) : asset.history }));
}

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
    const price = Math.max(asset.kind === 'CRYPTO' ? 0.01 : 5, asset.price * (1 + event.shock));
    return { ...asset, price, change: event.shock * 100, history: [...asset.history.slice(-14), price] };
  });
}

export function advanceMarketTick<T extends MarketAsset>(assets: T[], tick: number): { assets: T[]; event: MarketEvent | null } {
  const event = tick > 0 && tick % 15 === 0 ? MARKET_EVENTS[(tick / 15 - 1) % MARKET_EVENTS.length] : null;
  const moved = assets.map(asset => {
    const seed = Array.from(`${asset.id}:${asset.symbol}`).reduce((value, character) => (value * 33 + character.charCodeAt(0)) >>> 0, tick + 17);
    const random = ((1664525 * seed + 1013904223) >>> 0) / 4294967296;
    const drift = (asset.kind === 'CRYPTO' ? 0.0004 : 0.00015) + (random - 0.5) * asset.volatility * 1.5;
    const price = Math.max(asset.kind === 'CRYPTO' ? 0.01 : 5, asset.price * (1 + drift));
    return { ...asset, price, change: drift * 100, history: [...asset.history.slice(-14), price] };
  });
  return { assets: event ? applyMarketEvent(moved, event) : moved, event };
}

export function calculateQuarterlyDividends<T extends MarketAsset>(assets: T[], holdings: Record<string, { shares: number }>): number {
  return Number(assets.reduce((sum, asset) => sum + (holdings[asset.id]?.shares || 0) * asset.price * (asset.dividend / 100) / 4, 0).toFixed(2));
}

export function quarterKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
}

export function matchLimitOrders<T extends MarketAsset>(assets: T[], orders: LimitOrder[], timestamp: number): { orders: LimitOrder[]; fills: LimitOrder[] } {
  const fills: LimitOrder[] = [];
  const nextOrders = orders.map(order => {
    if (order.status !== 'OPEN') return order;
    const asset = assets.find(item => item.id === order.assetId);
    if (!asset) return order;
    const canFill = order.side === 'BUY' ? asset.price <= order.limitPrice : asset.price >= order.limitPrice;
    if (!canFill) return order;
    const filled = { ...order, status: 'FILLED' as const, filledAt: timestamp, filledPrice: asset.price };
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
