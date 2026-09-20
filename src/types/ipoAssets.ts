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
  maxShares?: number;
  isPlayerCompany?: boolean;
}
