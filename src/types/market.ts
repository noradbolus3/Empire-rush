export type LimitOrderSide = 'BUY' | 'SELL';
export type LimitOrderStatus = 'OPEN' | 'FILLED' | 'CANCELLED';

export interface LimitOrder {
  id: string;
  assetId: string;
  side: LimitOrderSide;
  quantity: number;
  limitPrice: number;
  createdAt: number;
  status: LimitOrderStatus;
  filledAt?: number;
  filledPrice?: number;
}

export interface PortfolioPoint {
  timestamp: number;
  value: number;
}

export interface RivalInvestor {
  id: string;
  name: string;
  strategy: string;
  netWorth: number;
  weeklyReturn: number;
}

export const DEFAULT_RIVAL_INVESTORS: RivalInvestor[] = [
  { id: 'rival-1', name: 'Maya Chen', strategy: 'Clean energy growth', netWorth: 4600, weeklyReturn: 6.8 },
  { id: 'rival-2', name: 'Jordan Blake', strategy: 'Dividend compounder', netWorth: 4200, weeklyReturn: 4.1 },
  { id: 'rival-3', name: 'Alex Rivera', strategy: 'Volatility trader', netWorth: 3900, weeklyReturn: 8.4 },
  { id: 'rival-4', name: 'Taylor Morgan', strategy: 'Defensive banking', netWorth: 3500, weeklyReturn: 2.7 },
];
