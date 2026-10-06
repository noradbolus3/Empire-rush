import { Asset } from '../types/marketAsset';
import { recentAssetTrend } from './marketEngine';

export type IndexDefinition = { name: string; kind: 'STOCK' | 'CRYPTO'; sectors?: string[]; description: string };
export type SimulatedIndex = { name: string; value: number; changePct: number; breadthPct: number; constituents: Asset[]; description: string };

export const STOCK_INDEX_DEFINITIONS: IndexDefinition[] = [
  { name: 'Empire Global', kind: 'STOCK', description: 'Broad simulated U.S. equity benchmark.' },
  { name: 'North America', kind: 'STOCK', sectors: ['TECH', 'BANKING', 'ENERGY', 'RETAIL', 'CONSUMER'], description: 'Large operating sectors across the fictional North American economy.' },
  { name: 'Tech Index', kind: 'STOCK', sectors: ['TECH', 'AI_CHIP', 'CONSUMER_TECH', 'ELECTRONICS', 'SOFTWARE', 'SOCIAL_TECH'], description: 'Software, devices, and compute leaders.' },
  { name: 'Energy Index', kind: 'STOCK', sectors: ['ENERGY', 'MOBILITY', 'AEROSPACE'], description: 'Power, transport, and infrastructure innovators.' },
  { name: 'Banking Index', kind: 'STOCK', sectors: ['BANKING', 'FINANCE', 'FINTECH', 'PAYMENTS'], description: 'Credit, capital markets, and payment rails.' },
  { name: 'Consumer Index', kind: 'STOCK', sectors: ['CONSUMER', 'RETAIL', 'TRAVEL'], description: 'Everyday spending and customer demand.' },
];

export const CRYPTO_INDEX_DEFINITIONS: IndexDefinition[] = [
  { name: 'Digital Asset 10', kind: 'CRYPTO', description: 'Broad simulated digital-asset benchmark.' },
  { name: 'Layer 1 Index', kind: 'CRYPTO', sectors: ['CRYPTO'], description: 'Core settlement networks and protocol activity.' },
  { name: 'DeFi Index', kind: 'CRYPTO', sectors: ['CRYPTO'], description: 'Liquidity and decentralized-finance sentiment.' },
];

export function getIndexConstituents(assets: Asset[], definition: IndexDefinition): Asset[] {
  const matching = assets.filter(asset => asset.kind === definition.kind);
  if (!definition.sectors?.length) return matching;
  return matching.filter(asset => definition.sectors!.includes(asset.sector || 'CRYPTO'));
}

export function calculateIndex(assets: Asset[], definition: IndexDefinition): SimulatedIndex {
  const constituents = getIndexConstituents(assets, definition);
  if (!constituents.length) return { name: definition.name, value: 0, changePct: 0, breadthPct: 0, constituents: [], description: definition.description };
  const value = Number((constituents.reduce((sum, asset) => sum + asset.price, 0) / constituents.length * 10).toFixed(2));
  const changes = constituents.map(recentAssetTrend);
  return { name: definition.name, value, changePct: Number((changes.reduce((sum, change) => sum + change, 0) / changes.length).toFixed(2)), breadthPct: Number((changes.filter(change => change > 0).length / changes.length * 100).toFixed(1)), constituents, description: definition.description };
}

export function calculateIndexSet(assets: Asset[], kind: 'STOCK' | 'CRYPTO'): SimulatedIndex[] {
  return (kind === 'STOCK' ? STOCK_INDEX_DEFINITIONS : CRYPTO_INDEX_DEFINITIONS).map(definition => calculateIndex(assets, definition));
}
