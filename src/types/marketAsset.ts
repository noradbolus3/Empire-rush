export type MarketSector = 'TECH' | 'ENERGY' | 'PHARMA' | 'MOBILITY' | 'BANKING' | 'RETAIL' | 'CRYPTO';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  kind: 'STOCK' | 'CRYPTO';
  price: number;
  change: number;
  dividend: number;
  volatility: number;
  history: number[];
  sector?: MarketSector;
  maxShares?: number;
  isPlayerCompany?: boolean;
}

export interface Holding {
  shares: number;
  avgPrice: number;
  realized: number;
}
