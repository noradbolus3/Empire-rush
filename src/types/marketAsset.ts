export type MarketSector = 'TECH' | 'ENERGY' | 'PHARMA' | 'MOBILITY' | 'BANKING' | 'RETAIL' | 'CRYPTO' | 'AEROSPACE' | 'MEDIA' | 'REAL_ESTATE' | 'CONSUMER';

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
  description?: string;
  maxShares?: number;
  isPlayerCompany?: boolean;
}

export interface Holding {
  shares: number;
  avgPrice: number;
  realized: number;
  realizedPnl?: number;
}
