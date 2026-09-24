export type IncomeCategory = 'tap' | 'business' | 'stocks' | 'mission' | 'ipo' | 'other';

export type IncomeEventInput = {
  source: string;
  amount: number;
  category: IncomeCategory;
};

export type IncomeEvent = IncomeEventInput & {
  id: string;
  timestamp: number;
};

export type IncomeSource = {
  label: string;
  perSecond: number;
  color: string;
  note?: string;
};
