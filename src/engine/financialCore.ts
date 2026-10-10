import type { BusinessEntity } from '../types/business';
import type { CollectionItem } from '../data/collectionTypes';
import type { Asset, Holding } from '../types/marketAsset';
import type { BankDeposit, BankInvestor, BankLoan, BankState, InsurancePolicy } from '../types/bank';
import type { BankLedgerEntry } from '../types/bank';

export type FinancialGameState = {
  cash: number;
  bank: Pick<BankState, 'savingsBalance' | 'businessCheckingBalance' | 'deposits' | 'loans' | 'insurance' | 'investors'>;
  assets: Asset[];
  holdings: Record<string, Holding>;
  owned: string[];
  lifestyleAssets: CollectionItem[];
  businesses: BusinessEntity[];
  systemTimeMs: number;
  multiplier?: number;
};

export type SettlementResult = {
  state: FinancialGameState;
  cashDelta: number;
  projectedHourlyNet: number;
  ledger: BankLedgerEntry[];
  breakdown: {
    businessRevenue: number;
    interest: number;
    emi: number;
    premiums: number;
    upkeep: number;
    investorShare: number;
    taxAccrual: number;
  };
};

const n = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;
const positive = (value: unknown) => Math.max(0, n(value));

export function calculateNetWorth(state: FinancialGameState): number {
  const portfolio = Object.entries(state.holdings || {}).reduce((sum, [id, holding]) => {
    const asset = state.assets.find(item => item.id === id);
    return sum + positive(holding?.shares) * positive(asset?.price);
  }, 0);
  const lifestyle = (state.owned || []).reduce((sum, id) => sum + positive(state.lifestyleAssets.find(item => item.id === id)?.price), 0);
  const businessAssets = (state.businesses || []).reduce((sum, business) => {
    if (!business.isAcquired) return sum;
    const inventory = business.sector === 'Retail' ? positive(business.stockUnits) * positive(business.unitWholesaleCost ?? 0) : 0;
    return sum + positive(business.acquisitionCost) + inventory + positive(business.pendingSettlementAmount);
  }, 0);
  const deposits = (state.bank.deposits || []).reduce((sum, deposit) => sum + (deposit.status === 'ACTIVE' ? positive(deposit.principal) : 0), 0);
  const debt = (state.bank.loans || []).reduce((sum, loan) => sum + (loan.status === 'ACTIVE' ? positive(loan.balance) : 0), 0);
  return Math.max(0, positive(state.cash) + positive(state.bank.savingsBalance) + positive(state.bank.businessCheckingBalance) + deposits + portfolio + lifestyle + businessAssets - debt);
}

function entry(id: string, kind: BankLedgerEntry['kind'], label: string, amount: number, timestamp: number, detail: string): BankLedgerEntry {
  return { id, kind, label, amount: Number(amount.toFixed(2)), timestamp, detail };
}

function businessRevenue(state: FinancialGameState) {
  return (state.businesses || []).reduce((sum, item) => sum + (item.isAcquired ? positive(item.hourlyNetProfit) : 0), 0) * (state.multiplier ?? 1);
}
function savingsInterest(state: FinancialGameState) {
  const savings = positive(state.bank.savingsBalance) * 0.0425 / 8760;
  const deposits = (state.bank.deposits || []).filter(item => item.status === 'ACTIVE').reduce((sum, item) => sum + positive(item.principal) * positive(item.rate) / 365 / 24, 0);
  return savings + deposits;
}
function emi(state: FinancialGameState) { return (state.bank.loans || []).filter(item => item.status === 'ACTIVE').reduce((sum, item) => sum + positive(item.monthlyPayment) / 30 / 24, 0); }
function premiums(state: FinancialGameState) { return (state.bank.insurance || []).filter(item => item.active).reduce((sum, item) => sum + positive(item.premium) / 30 / 24, 0); }
function upkeep(state: FinancialGameState) { return (state.owned || []).reduce((sum, id) => sum + positive(state.lifestyleAssets.find(item => item.id === id)?.upkeep) / 30 / 24, 0); }
function investorShare(state: FinancialGameState, revenue: number) { return (state.bank.investors || []).reduce((sum, investor) => sum + revenue * positive(investor.equityPercent) / 100, 0); }

export function settleHour(state: FinancialGameState): SettlementResult {
  const timestamp = state.systemTimeMs;
  const revenue = businessRevenue(state);
  const interest = savingsInterest(state);
  const loanEmi = emi(state);
  const premium = premiums(state);
  const assetUpkeep = upkeep(state);
  const share = investorShare(state, revenue);
  const taxAccrual = Math.max(0, revenue + interest - loanEmi - premium - assetUpkeep - share) * 0.21;
  const loanUpdates = (state.bank.loans || []).map(loan => {
    if (loan.status !== 'ACTIVE') return loan;
    const payment = Math.min(positive(loan.balance), positive(loan.monthlyPayment) / 30 / 24);
    const interestPart = positive(loan.balance) * positive(loan.apr) / 100 / 8760;
    const principalPart = Math.max(0, payment - interestPart);
    return { ...loan, balance: Math.max(0, loan.balance - principalPart), status: loan.balance - principalPart <= 0.01 ? 'PAID' as const : loan.status, nextDueAt: loan.nextDueAt + 3600000 };
  });
  const items: BankLedgerEntry[] = [
    entry(`settle-business-${timestamp}`, 'BUSINESS_REVENUE', 'Business revenue', revenue, timestamp, 'Unified hourly settlement'),
    entry(`settle-interest-${timestamp}`, 'INTEREST', 'Savings and deposit interest', interest, timestamp, 'Unified hourly settlement'),
    entry(`settle-emi-${timestamp}`, 'EMI', 'Loan EMI', -loanEmi, timestamp, 'Interest and principal split; active balances reduced'),
    entry(`settle-premium-${timestamp}`, 'PREMIUM', 'Insurance premiums', -premium, timestamp, 'Active policy premiums'),
    entry(`settle-upkeep-${timestamp}`, 'UPKEEP', 'Lifestyle upkeep', -assetUpkeep, timestamp, 'Owned lifestyle asset upkeep'),
    entry(`settle-investor-${timestamp}`, 'INVESTOR', 'Investor profit share', -share, timestamp, 'Public/investor ownership share'),
    entry(`settle-tax-${timestamp}`, 'TAX', 'Tax accrual', taxAccrual, timestamp, 'Accrued, not paid'),
  ];
  const cashDelta = revenue + interest - loanEmi - premium - assetUpkeep - share;
  return { state: { ...state, bank: { ...state.bank, loans: loanUpdates } }, cashDelta: Number(cashDelta.toFixed(2)), projectedHourlyNet: Number(cashDelta.toFixed(2)), ledger: items, breakdown: { businessRevenue: revenue, interest, emi: loanEmi, premiums: premium, upkeep: assetUpkeep, investorShare: share, taxAccrual } };
}

export const emptyFinancialState = (now = Date.now()): FinancialGameState => ({ cash: 0, bank: { savingsBalance: 0, businessCheckingBalance: 0, deposits: [], loans: [], insurance: [], investors: [] }, assets: [], holdings: {}, owned: [], lifestyleAssets: [], businesses: [], systemTimeMs: now });
