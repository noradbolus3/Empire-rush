export type PriceAlertCondition = 'ABOVE' | 'BELOW' | 'PCT_MOVE';

export interface PriceAlert {
  id: string;
  assetId: string;
  symbol: string;
  name: string;
  condition: PriceAlertCondition;
  target: number;
  baselinePrice: number;
  enabled: boolean;
  createdAt: number;
  triggeredAt?: number;
}

export interface TechnicalSnapshot {
  sma20: number | null;
  ema12: number | null;
  ema26: number | null;
  rsi14: number | null;
  macd: number | null;
  signal9: number | null;
  histogram: number | null;
  bollingerUpper: number | null;
  bollingerLower: number | null;
  trend: 'UPTREND' | 'DOWNTREND' | 'RANGE';
}

export interface AlertEvaluation {
  alert: PriceAlert;
  triggered: boolean;
  reason: string;
}
