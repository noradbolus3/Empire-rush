import type { BusinessEntity } from '../types/business';
import type { CollectionItem } from '../data/collectionTypes';
import type { Asset, Holding } from '../types/marketAsset';
import type { BankDeposit, BankInvestor, BankLoan, BankMarketEvent, BankState, InsurancePolicy, BankLedgerEntry, TaxRecord } from '../types/bank';
import { calculateTax, depositSpec, isActiveLoan } from './bankEngine';

export type FinancialGameState = {
  cash: number;
  bank: Pick<BankState, 'savingsBalance' | 'businessCheckingBalance' | 'deposits' | 'loans' | 'insurance' | 'investors' | 'savingsRateBoostUntil' | 'taxRecords' | 'marketEvents'>;
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
  breakdown: { businessRevenue: number; interest: number; emi: number; premiums: number; upkeep: number; investorShare: number; taxAccrual: number };
};

const n = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;
const positive = (value: unknown) => Math.max(0, n(value));
const round = (value: number) => Number(value.toFixed(2));

export function calculateNetWorth(state: FinancialGameState): number {
  const portfolio = Object.entries(state.holdings || {}).reduce((sum, [id, holding]) => sum + positive(holding?.shares) * positive(state.assets.find(item => item.id === id)?.price), 0);
  const lifestyle = (state.owned || []).reduce((sum, id) => sum + positive(state.lifestyleAssets.find(item => item.id === id)?.price), 0);
  const businessAssets = (state.businesses || []).reduce((sum, business) => {
    if (!business.isAcquired) return sum;
    const inventory = business.sector === 'Retail' ? positive(business.stockUnits) * positive(business.unitWholesaleCost ?? 0) : 0;
    return sum + positive(business.acquisitionCost) + inventory + positive(business.pendingSettlementAmount);
  }, 0);
  const deposits = (state.bank.deposits || []).reduce((sum, deposit) => sum + (deposit.status === 'ACTIVE' ? positive(deposit.principal) : 0), 0);
  const debt = (state.bank.loans || []).reduce((sum, loan) => sum + (isActiveLoan(loan) ? positive(loan.balance) : 0), 0);
  return Math.max(0, positive(state.cash) + positive(state.bank.savingsBalance) + positive(state.bank.businessCheckingBalance) + deposits + portfolio + lifestyle + businessAssets - debt);
}

function entry(id: string, kind: BankLedgerEntry['kind'], label: string, amount: number, timestamp: number, detail: string): BankLedgerEntry {
  return { id, kind, label, amount: round(amount), timestamp, detail };
}
function businessRevenue(state: FinancialGameState) { return (state.businesses || []).reduce((sum, item) => sum + (item.isAcquired ? positive(item.hourlyNetProfit) : 0), 0) * (state.multiplier ?? 1); }
function savingsInterest(state: FinancialGameState) {
  const event = state.bank.marketEvents?.[state.bank.marketEvents.length - 1];
  const eventBump = event?.kind === 'RECESSION' || event?.kind === 'RATE_HIKE' ? event.cdRateBump / 100 : 0;
  const savingsRate = (state.bank.savingsRateBoostUntil > state.systemTimeMs ? 0.0525 : 0.0425) + eventBump;
  const savings = positive(state.bank.savingsBalance) * savingsRate / 8760;
  const deposits = (state.bank.deposits || []).filter(item => item.status === 'ACTIVE').reduce((sum, item) => sum + positive(item.principal) * (positive(item.rate) / 100) / 365 / 24, 0);
  return savings + deposits;
}
function upkeep(state: FinancialGameState) { return (state.owned || []).reduce((sum, id) => sum + positive(state.lifestyleAssets.find(item => item.id === id)?.upkeep) / 30 / 24, 0); }
function investorShare(state: FinancialGameState, revenue: number) { return (state.bank.investors || []).reduce((sum, investor) => sum + revenue * positive(investor.equityPercent) / 100, 0); }
function loanParts(state: FinancialGameState) {
  return (state.bank.loans || []).filter(isActiveLoan).reduce((result, loan) => {
    const payment = Math.min(positive(loan.balance), positive(loan.monthlyPayment) / 30 / 24);
    const interest = positive(loan.balance) * positive(loan.apr) / 100 / 8760;
    result.emi += payment; result.interest += Math.min(payment, interest); result.principal += Math.max(0, payment - interest); return result;
  }, { emi: 0, interest: 0, principal: 0 });
}

export function settleHour(state: FinancialGameState): SettlementResult {
  const timestamp = state.systemTimeMs;
  const revenue = businessRevenue(state);
  const interest = savingsInterest(state);
  const loan = loanParts(state);
  const premium = (state.bank.insurance || []).filter(item => item.active).reduce((sum, item) => sum + positive(item.premium) / 30 / 24, 0);
  const assetUpkeep = upkeep(state);
  const share = investorShare(state, revenue);
  const taxableIncome = Math.max(0, revenue + interest - loan.interest - assetUpkeep - premium);
  const priorGains = (state.bank.taxRecords || []).filter(item => item.status !== 'PAID').reduce((sum, item) => sum + positive(item.capitalGains), 0);
  const tax = calculateTax(taxableIncome * 24 * 365, loan.interest * 24 * 365 + assetUpkeep * 24 * 365 + premium * 24 * 365, priorGains, (state.businesses || []).filter(item => item.isAcquired && Number(item.staffCount || 0) > 0).reduce((sum, item) => sum + positive(item.hourlyNetProfit) * 0.2, 0));
  const taxAccrual = tax.federal / 8760 + tax.state / 8760 + tax.payroll / 8760 + tax.capitalGains / 8760;
  const matured: BankDeposit[] = (state.bank.deposits || []).map(deposit => deposit.status === 'ACTIVE' && deposit.maturesAt <= timestamp ? { ...deposit, status: 'MATURED' as const } : deposit);
  const maturityPayout = matured.filter((deposit, index) => deposit.status === 'MATURED' && state.bank.deposits[index]?.status === 'ACTIVE').reduce((sum, deposit) => sum + deposit.principal + deposit.principal * deposit.rate / 100 * deposit.termDays / 365, 0);
  const marketEvent = state.bank.marketEvents?.[state.bank.marketEvents.length - 1];
  const insurancePayout = marketEvent?.kind === 'RECESSION' ? (state.bank.insurance || []).filter(item => item.active).reduce((sum, policy) => sum + Math.max(0, policy.coverage - policy.deductible) * 0.1, 0) : 0;
  const loanUpdates = (state.bank.loans || []).map(item => {
    if (!isActiveLoan(item)) return item;
    const nextBalance = Math.max(0, item.balance - loanParts(state).principal);
    return { ...item, balance: round(nextBalance), status: nextBalance <= 0.01 ? 'paid_off' as const : item.status, nextDueAt: item.nextDueAt + 3600000 };
  });
  const taxRecords: TaxRecord[] = [...(state.bank.taxRecords || []).filter(item => item.status !== 'ESTIMATE'), { ...tax, id: `tax-${timestamp}`, dueAt: timestamp + 90 * 24 * 3600000 }];
  const items: BankLedgerEntry[] = [
    entry(`settle-business-${timestamp}`, 'BUSINESS_REVENUE', 'Business revenue', revenue, timestamp, 'Unified hourly settlement'),
    entry(`settle-interest-${timestamp}`, 'INTEREST', 'Savings and deposit interest', interest, timestamp, 'Actual balances and APY'),
    entry(`settle-emi-${timestamp}`, 'EMI', 'Loan EMI', -loan.emi, timestamp, `Interest ${round(loan.interest)} · principal ${round(loan.principal)}`),
    entry(`settle-premium-${timestamp}`, 'PREMIUM', 'Insurance premiums', -premium, timestamp, 'Active policies'),
    entry(`settle-upkeep-${timestamp}`, 'UPKEEP', 'Lifestyle upkeep', -assetUpkeep, timestamp, 'Owned lifestyle assets'),
    entry(`settle-investor-${timestamp}`, 'INVESTOR', 'Investor profit share', -share, timestamp, 'Ownership-based deduction'),
    entry(`settle-tax-${timestamp}`, 'TAX', 'Tax accrual', -taxAccrual, timestamp, 'Accrued liability; not paid until Tax Day'),
  ];
  if (maturityPayout > 0) items.push(entry(`deposit-maturity-${timestamp}`, 'INTEREST', 'Deposit maturity payout', maturityPayout, timestamp, 'Principal plus earned term interest'));
  if (insurancePayout > 0) items.push(entry(`insurance-payout-${timestamp}`, 'INSURANCE', 'Recession insurance payout', insurancePayout, timestamp, 'Covered negative event payout after deductible'));
  const cashDelta = revenue + interest + maturityPayout + insurancePayout - loan.emi - premium - assetUpkeep - share;
  const projectedHourlyNet = cashDelta - taxAccrual;
  return { state: { ...state, bank: { ...state.bank, loans: loanUpdates, deposits: matured, taxRecords } }, cashDelta: round(cashDelta), projectedHourlyNet: round(projectedHourlyNet), ledger: items, breakdown: { businessRevenue: revenue, interest, emi: loan.emi, premiums: premium, upkeep: assetUpkeep, investorShare: share, taxAccrual } };
}

export const emptyFinancialState = (now = Date.now()): FinancialGameState => ({ cash: 0, bank: { savingsBalance: 0, businessCheckingBalance: 0, deposits: [], loans: [], insurance: [], investors: [], savingsRateBoostUntil: 0, taxRecords: [], marketEvents: [] }, assets: [], holdings: {}, owned: [], lifestyleAssets: [], businesses: [], systemTimeMs: now });
