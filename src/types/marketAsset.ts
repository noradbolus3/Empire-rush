export type MarketSector =
  | "TECH"
  | "ENERGY"
  | "PHARMA"
  | "MOBILITY"
  | "BANKING"
  | "RETAIL"
  | "CRYPTO"
  | "AEROSPACE"
  | "MEDIA"
  | "REAL_ESTATE"
  | "CONSUMER"
  | "AI_CHIP"
  | "CONSUMER_TECH"
  | "ELECTRONICS"
  | "SOFTWARE"
  | "SOCIAL_TECH"
  | "FINTECH"
  | "PAYMENTS"
  | "FINANCE"
  | "TRAVEL";

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  kind: "STOCK" | "CRYPTO";
  price: number;
  change: number;
  dividend: number;
  volatility: number;
  history: number[];
  sector?: MarketSector;
  logo?: number;
  maxShares?: number;
  isPlayerCompany?: boolean;
}

export interface Holding {
  shares: number;
  avgPrice: number;
  realized: number;
  realizedPnl?: number;
  acquiredAtMs?: number;
}
