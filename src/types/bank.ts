export type BankTab = 'home' | 'accounts' | 'loans' | 'investors';
export type BankTier = 'Basic' | 'Silver' | 'Gold' | 'Platinum' | 'Private';
export type LoanProduct = 'SBA_MICROLOAN' | 'SBA_STARTUP' | 'TERM_LOAN' | 'LINE_OF_CREDIT' | 'COMMERCIAL_MORTGAGE' | 'EQUIPMENT_FINANCE' | 'CREDIT_CARD';
export type InvestorRound = 'FRIENDS_FAMILY' | 'ANGEL' | 'PRE_SEED' | 'SEED' | 'SERIES_A';
export type InvestorInstrument = 'SAFE' | 'CONVERTIBLE_NOTE' | 'PRICED_EQUITY';

export type BankOffer = {
  id: string;
  kind: 'LOAN' | 'INVESTOR' | 'SAVINGS';
  title: string;
  detail: string;
  amount?: number;
  rate?: number;
  expiresAt: number;
};

export type BankLoan = {
  id: string;
  product: LoanProduct;
  name: string;
  principal: number;
  balance: number;
  apr: number;
  termMonths: number;
  monthlyPayment: number;
  nextDueAt: number;
  originationFee: number;
  collateral: string;
  status: 'ACTIVE' | 'PAID' | 'DEFAULTED';
  hardInquiry: boolean;
  graceDays: number;
  delinquencyDays: number;
};

export type BankInvestor = {
  id: string;
  firm: string;
  round: InvestorRound;
  instrument: InvestorInstrument;
  invested: number;
  equityPercent: number;
  boardSeat: boolean;
  joinedAt: number;
};

export type BankState = {
  schemaVersion: number;
  savingsBalance: number;
  businessCheckingBalance: number;
  overdraftProtection: boolean;
  ficoScore: number;
  totalInterestEarned: number;
  totalInterestPaid: number;
  loans: BankLoan[];
  investors: BankInvestor[];
  offers: BankOffer[];
  lastSettlementAt: number;
  lastAwaySummary: { interestEarned: number; paymentsMade: number; newOffers: number; at: number } | null;
  lastOfferSequence: number;
};

export const BANK_SCHEMA_VERSION = 1;

export function defaultBankState(now = Date.now()): BankState {
  return {
    schemaVersion: BANK_SCHEMA_VERSION,
    savingsBalance: 0,
    businessCheckingBalance: 0,
    overdraftProtection: true,
    ficoScore: 680,
    totalInterestEarned: 0,
    totalInterestPaid: 0,
    loans: [],
    investors: [],
    offers: [],
    lastSettlementAt: now,
    lastAwaySummary: null,
    lastOfferSequence: 0,
  };
}
