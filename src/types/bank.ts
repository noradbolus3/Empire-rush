export type BankTab = 'home' | 'accounts' | 'loans' | 'investors' | 'credit' | 'deposits' | 'insurance' | 'tax' | 'history';
export type BankTier = 'Basic' | 'Silver' | 'Gold' | 'Platinum' | 'Private';
export type LoanProduct = 'SBA_MICROLOAN' | 'SBA_STARTUP' | 'TERM_LOAN' | 'LINE_OF_CREDIT' | 'COMMERCIAL_MORTGAGE' | 'EQUIPMENT_FINANCE' | 'CREDIT_CARD';
export type InvestorRound = 'FRIENDS_FAMILY' | 'ANGEL' | 'PRE_SEED' | 'SEED' | 'SERIES_A' | 'SERIES_B' | 'SERIES_C' | 'IPO';
export type InvestorInstrument = 'SAFE' | 'CONVERTIBLE_NOTE' | 'PRICED_EQUITY';
export type DepositProduct = 'CD_3M' | 'CD_6M' | 'CD_12M' | 'RETIREMENT_IRA' | 'TREASURY_BILL' | 'TREASURY_NOTE' | 'TREASURY_BOND';
export type InsuranceProduct = 'GENERAL_LIABILITY' | 'PROPERTY' | 'COMMERCIAL_AUTO' | 'KEY_PERSON' | 'CYBER';
export type LedgerKind = 'DEPOSIT' | 'WITHDRAWAL' | 'LOAN' | 'INTEREST' | 'FEE' | 'TAX' | 'INSURANCE' | 'INVESTOR' | 'ACHIEVEMENT' | 'TRADE' | 'PURCHASE' | 'UPKEEP' | 'EMI' | 'PREMIUM' | 'CAPITAL_GAIN' | 'BUSINESS_REVENUE' | 'TRANSFER';

export type BankOffer = { id: string; kind: 'LOAN' | 'INVESTOR' | 'SAVINGS'; title: string; detail: string; amount?: number; rate?: number; expiresAt?: number };
export type BankLoan = { id: string; product: LoanProduct; name: string; principal: number; balance: number; apr: number; termMonths: number; monthlyPayment: number; nextDueAt: number; originationFee: number; collateral: string; collateralAssetId?: string; collateralAssetName?: string; status: 'ACTIVE' | 'PAID' | 'DEFAULTED'; hardInquiry: boolean; graceDays: number; delinquencyDays: number };
export type BankInvestor = { id: string; firm: string; round: InvestorRound; instrument: InvestorInstrument; invested: number; equityPercent: number; boardSeat: boolean; joinedAt: number };
export type BankRival = { id: string; name: string; netWorth: number; growthRate: number; volatility: number; lastUpdatedAt: number };
export type CreditSnapshot = { timestamp: number; score: number; paymentHistory: number; utilization: number; historyLength: number; newCredit: number; creditMix: number };
export type BankDeposit = { id: string; product: DepositProduct; name: string; principal: number; rate: number; termDays: number; openedAt: number; maturesAt: number; earlyPenaltyRate: number; status: 'ACTIVE' | 'MATURED' | 'WITHDRAWN' };
export type InsurancePolicy = { id: string; product: InsuranceProduct; name: string; premium: number; deductible: number; coverage: number; active: boolean; purchasedAt: number; lastPaidAt: number; insuredAssetId?: string; insuredAssetName?: string };
export type TaxRecord = { id: string; year: number; income: number; deductions: number; federal: number; state: number; payroll: number; capitalGains: number; paid: number; dueAt: number; status: 'ESTIMATE' | 'PAID' | 'LATE' };
export type BankLedgerEntry = { id: string; kind: LedgerKind; label: string; amount: number; timestamp: number; detail: string };
export type BankMarketEvent = { id: string; kind: 'RATE_HIKE' | 'RECESSION' | 'FUNDING_BOOM'; headline: string; primeRate: number; cdRateBump: number; investorAppetite: number; timestamp: number };

export type BankState = {
  schemaVersion: number; savingsBalance: number; businessCheckingBalance: number; overdraftProtection: boolean; ficoScore: number; totalInterestEarned: number; totalInterestPaid: number; loans: BankLoan[]; investors: BankInvestor[]; offers: BankOffer[]; lastSettlementAt: number; lastAwaySummary: { interestEarned: number; paymentsMade: number; newOffers: number; at: number } | null; lastOfferSequence: number;
  creditHistory: CreditSnapshot[]; deposits: BankDeposit[]; insurance: InsurancePolicy[]; taxRecords: TaxRecord[]; ledger: BankLedgerEntry[]; achievements: string[]; loginStreak: number; lastLoginAt: number; weeklyInterestEarned: number; marketEvents: BankMarketEvent[]; companyValuation: number; rivals: BankRival[]; acceptedOfferIds: string[]; savingsRateBoostUntil: number; accountOpenedAt?: number; totalCreditLimit?: number; hardInquiries?: number;
};

export const BANK_SCHEMA_VERSION = 2;
export const PHASE2_ACHIEVEMENTS = ['FIRST_LOAN', 'DEBT_FREE', 'FICO_800', 'FIRST_MILLION_RAISED', 'UNICORN', 'IPO_DAY', 'TEN_CDS_MATURED'] as const;

export function defaultBankState(now = Date.now()): BankState {
  return { schemaVersion: BANK_SCHEMA_VERSION, savingsBalance: 0, businessCheckingBalance: 0, overdraftProtection: true, ficoScore: 680, totalInterestEarned: 0, totalInterestPaid: 0, loans: [], investors: [], offers: [], lastSettlementAt: now, lastAwaySummary: null, lastOfferSequence: 0, creditHistory: [{ timestamp: now, score: 680, paymentHistory: 72, utilization: 30, historyLength: 40, newCredit: 78, creditMix: 55 }], deposits: [], insurance: [], taxRecords: [], ledger: [], achievements: [], loginStreak: 1, lastLoginAt: now, weeklyInterestEarned: 0, marketEvents: [], companyValuation: 0, rivals: [], acceptedOfferIds: [], savingsRateBoostUntil: 0 };
}
