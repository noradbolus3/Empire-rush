import { Asset } from '../types/marketAsset';
import type { BankMarketEvent } from '../types/bank';

export type ScheduledMarketEvent = {
  id: string;
  headline: string;
  kind: 'STOCK' | 'CRYPTO' | 'ALL';
  sectors?: string[];
  shock: number;
  tick: number;
  tone: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  bankKind: BankMarketEvent['kind'];
  primeRate: number;
  cdRateBump: number;
  investorAppetite: number;
};

export const SCHEDULED_MARKET_EVENTS: ScheduledMarketEvent[] = [
  { id: 'fed-soft-landing', headline: 'Fed signals a softer landing; growth demand improves.', kind: 'STOCK', sectors: ['TECH', 'SOFTWARE', 'AI_CHIP'], shock: 0.035, tick: 12, tone: 'POSITIVE', bankKind: 'FUNDING_BOOM', primeRate: 6.25, cdRateBump: -0.1, investorAppetite: 0.2 },
  { id: 'bank-credit', headline: 'Credit conditions tighten; lenders reprice risk.', kind: 'STOCK', sectors: ['BANKING', 'FINANCE'], shock: -0.045, tick: 24, tone: 'NEGATIVE', bankKind: 'RATE_HIKE', primeRate: 7.25, cdRateBump: 0.55, investorAppetite: -0.08 },
  { id: 'energy-grid', headline: 'Grid investment accelerates; infrastructure demand rises.', kind: 'STOCK', sectors: ['ENERGY', 'AEROSPACE'], shock: 0.05, tick: 36, tone: 'POSITIVE', bankKind: 'FUNDING_BOOM', primeRate: 6.25, cdRateBump: -0.1, investorAppetite: 0.2 },
  { id: 'consumer-pullback', headline: 'Household budgets tighten; discretionary demand cools.', kind: 'STOCK', sectors: ['RETAIL', 'CONSUMER', 'TRAVEL'], shock: -0.03, tick: 48, tone: 'NEGATIVE', bankKind: 'RECESSION', primeRate: 7.75, cdRateBump: 0.2, investorAppetite: -0.25 },
  { id: 'crypto-liquidity', headline: 'Digital-asset liquidity expands across the simulated network.', kind: 'CRYPTO', shock: 0.06, tick: 60, tone: 'POSITIVE', bankKind: 'FUNDING_BOOM', primeRate: 6.25, cdRateBump: -0.1, investorAppetite: 0.2 },
  { id: 'risk-off', headline: 'Risk-off session sends a broad cash rotation through markets.', kind: 'ALL', shock: -0.025, tick: 72, tone: 'NEGATIVE', bankKind: 'RECESSION', primeRate: 7.75, cdRateBump: 0.2, investorAppetite: -0.25 },
];

export function scheduledEventForTick(tick: number): ScheduledMarketEvent | null {
  return SCHEDULED_MARKET_EVENTS.find(event => event.tick > 0 && tick % event.tick === 0) || null;
}

export function bankEventFromScheduled(event: ScheduledMarketEvent, timestamp: number): BankMarketEvent {
  return { id: event.id, kind: event.bankKind, headline: event.headline, primeRate: event.primeRate, cdRateBump: event.cdRateBump, investorAppetite: event.investorAppetite, timestamp };
}

export function eventMatchesAsset(event: ScheduledMarketEvent, asset: Asset): boolean {
  if (event.kind !== 'ALL' && asset.kind !== event.kind) return false;
  return !event.sectors?.length || event.sectors.includes(asset.sector || 'CRYPTO');
}

export function applyScheduledEvent(assets: Asset[], event: ScheduledMarketEvent): Asset[] {
  return assets.map(asset => {
    if (!eventMatchesAsset(event, asset)) return asset;
    const floor = asset.kind === 'CRYPTO' ? 0.01 : 5;
    const price = Math.max(floor, Number((asset.price * (1 + event.shock)).toFixed(8)));
    return { ...asset, price, change: Number((event.shock * 100).toFixed(2)), history: [...asset.history.slice(-14), price] };
  });
}
