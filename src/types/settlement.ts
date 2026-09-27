export type SettlementRate = {
  businessId: string;
  source: string;
  hourlyRate: number;
};

export type SettlementCredit = SettlementRate & {
  hours: number;
  amount: number;
};

export type SettlementResult = {
  elapsedSeconds: number;
  completedHours: number;
  nextSettlementAtMs: number;
  totalAmount: number;
  credits: SettlementCredit[];
  remaining: Record<string, { amount: number; seconds: number }>;
};
