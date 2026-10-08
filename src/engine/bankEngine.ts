import { BankLoan, BankOffer, BankState, InvestorRound, LoanProduct, defaultBankState } from '../types/bank';

export const PRIME_RATE = 6.5;
export const BANK_SETTLEMENT_MS = 60 * 60 * 1000;
export const MAX_BANK_OFFLINE_HOURS = 24;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
const safeMoney = (n: number) => Number(Math.max(0, n).toFixed(2));

export function bankTier(netWorth: number): { tier: BankState['schemaVersion'] extends never ? never : string; progress: number; next: string; threshold: number } {
  const tiers = [
    { name: 'Basic', threshold: 0 },
    { name: 'Silver', threshold: 10_000 },
    { name: 'Gold', threshold: 100_000 },
    { name: 'Platinum', threshold: 1_000_000 },
    { name: 'Private', threshold: 10_000_000 },
  ];
  const safe = Math.max(0, netWorth);
  let current = tiers[0];
  let next = tiers[1];
  for (let i = 0; i < tiers.length; i += 1) {
    if (safe >= tiers[i].threshold) { current = tiers[i]; next = tiers[i + 1] || tiers[i]; }
  }
  const span = Math.max(1, next.threshold - current.threshold);
  return { tier: current.name, progress: current === next ? 1 : clamp((safe - current.threshold) / span, 0, 1), next: current === next ? 'All tiers unlocked' : `${next.name} at $${next.threshold.toLocaleString('en-US')}`, threshold: next.threshold };
}

export function loanProduct(name: LoanProduct): { name: string; max: number; termMonths: number; spread: number; collateral: string; fee: number } {
  const products: Record<LoanProduct, { name: string; max: number; termMonths: number; spread: number; collateral: string; fee: number }> = {
    SBA_MICROLOAN: { name: 'SBA Microloan', max: 50_000, termMonths: 36, spread: 4.5, collateral: 'Business assets', fee: 1 },
    SBA_STARTUP: { name: 'SBA 7(a) Startup Loan', max: 500_000, termMonths: 120, spread: 3.5, collateral: 'Business guarantee', fee: 2 },
    TERM_LOAN: { name: 'Business Term Loan', max: 1_000_000, termMonths: 84, spread: 4, collateral: 'Business assets', fee: 2 },
    LINE_OF_CREDIT: { name: 'Business Line of Credit', max: 250_000, termMonths: 60, spread: 5, collateral: 'Receivables', fee: 1.5 },
    COMMERCIAL_MORTGAGE: { name: 'Commercial Mortgage', max: 5_000_000, termMonths: 240, spread: 2.5, collateral: 'Owned properties · 20% down', fee: 1.5 },
    EQUIPMENT_FINANCE: { name: 'Equipment / Vehicle Financing', max: 500_000, termMonths: 60, spread: 3.75, collateral: 'Cars, yachts, or jets', fee: 1.5 },
    CREDIT_CARD: { name: 'Business Credit Card', max: 25_000, termMonths: 24, spread: 12, collateral: 'Unsecured · grace period', fee: 3 },
  };
  return products[name];
}

export function bankApr(ficoScore: number, product: LoanProduct, debtToIncome = 0, collateral = false): number {
  const p = loanProduct(product);
  const ficoAdjustment = ficoScore >= 760 ? -1.25 : ficoScore >= 700 ? 0 : ficoScore >= 640 ? 1.75 : 4;
  const dtiAdjustment = debtToIncome > 0.45 ? 2 : debtToIncome > 0.3 ? 0.75 : 0;
  const collateralDiscount = collateral ? 0.75 : 0;
  return Number(clamp(PRIME_RATE + p.spread + ficoAdjustment + dtiAdjustment - collateralDiscount, 4.99, 29.99).toFixed(2));
}

export function monthlyPayment(principal: number, apr: number, termMonths: number): number {
  const amount = Math.max(0, principal);
  const months = Math.max(1, Math.floor(termMonths));
  const monthlyRate = Math.max(0, apr) / 100 / 12;
  if (monthlyRate === 0) return safeMoney(amount / months);
  return safeMoney(amount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months)));
}

export function underwriteLoan(state: BankState, product: LoanProduct, requested: number, netWorth: number, hourlyIncome: number): { decision: 'APPROVE' | 'COUNTER' | 'DECLINE'; amount: number; apr: number; reason: string } {
  const spec = loanProduct(product);
  const amount = clamp(requested, 0, spec.max);
  const debt = state.loans.filter(loan => loan.status === 'ACTIVE').reduce((sum, loan) => sum + loan.monthlyPayment, 0);
  const annualizedIncome = Math.max(0, hourlyIncome) * 24 * 30;
  const dti = annualizedIncome > 0 ? debt / annualizedIncome : 1;
  const apr = bankApr(state.ficoScore, product, dti, product === 'COMMERCIAL_MORTGAGE' || product === 'EQUIPMENT_FINANCE');
  if (amount <= 0) return { decision: 'DECLINE', amount: 0, apr, reason: 'Enter an amount above $0.' };
  if (state.ficoScore < 580) return { decision: 'DECLINE', amount: 0, apr, reason: 'FICO below 580. Pay down balances and rebuild payment history.' };
  const capacity = Math.max(spec.max * 0.1, netWorth * (product === 'SBA_MICROLOAN' ? 0.35 : 1.5));
  if (amount > capacity) return { decision: 'COUNTER', amount: safeMoney(capacity), apr, reason: `Underwriting counter-offer: current cashflow supports ${money(capacity)}.` };
  if (dti > 0.65) return { decision: 'DECLINE', amount: 0, apr, reason: 'Debt-to-income is above the bank limit.' };
  return { decision: 'APPROVE', amount, apr, reason: 'Approved with current FICO, cashflow, and debt-to-income.' };
}

export function createLoan(state: BankState, product: LoanProduct, amount: number, apr: number, now: number): BankLoan {
  const spec = loanProduct(product);
  const principal = safeMoney(amount);
  return { id: `loan-${now}-${state.loans.length}`, product, name: spec.name, principal, balance: principal, apr, termMonths: spec.termMonths, monthlyPayment: monthlyPayment(principal, apr, spec.termMonths), nextDueAt: now + BANK_SETTLEMENT_MS * 24 * 30, originationFee: safeMoney(principal * spec.fee / 100), collateral: spec.collateral, status: 'ACTIVE', hardInquiry: true, graceDays: 7, delinquencyDays: 0 };
}

export function offersForSettlement(state: BankState, now: number, netWorth: number): BankOffer[] {
  const seq = state.lastOfferSequence + 1;
  const base = [
    { id: `offer-loan-${seq}`, kind: 'LOAN' as const, title: 'Pre-approved SBA Microloan', detail: 'Reachable early-game capital with a capped balance.', amount: Math.min(50_000, Math.max(5_000, netWorth * 0.35)), rate: bankApr(state.ficoScore, 'SBA_MICROLOAN') },
    { id: `offer-investor-${seq}`, kind: 'INVESTOR' as const, title: 'Investor meeting available', detail: 'Pitch a fictional seed fund against your growth.', amount: Math.max(25_000, netWorth * 0.75) },
    { id: `offer-savings-${seq}`, kind: 'SAVINGS' as const, title: 'Boosted savings window', detail: 'Earn 4.25% APY until the next settlement cycle.', rate: 4.25 },
  ];
  return base.map(item => ({ ...item, expiresAt: now + BANK_SETTLEMENT_MS * 2 }));
}

export function settleBank(state: BankState, now: number, netWorth: number): { state: BankState; cashDelta: number; interestEarned: number; paymentsMade: number; newOffers: number; completedHours: number } {
  const safeNow = Number.isFinite(now) ? now : Date.now();
  const last = Number.isFinite(state.lastSettlementAt) ? state.lastSettlementAt : safeNow;
  const completedHours = Math.min(MAX_BANK_OFFLINE_HOURS, Math.floor(Math.max(0, safeNow - last) / BANK_SETTLEMENT_MS));
  if (completedHours <= 0) return { state, cashDelta: 0, interestEarned: 0, paymentsMade: 0, newOffers: 0, completedHours: 0 };
  const savingsRate = 0.0425 / 365 / 24;
  const interestEarned = safeMoney(state.savingsBalance * savingsRate * completedHours);
  let cashDelta = interestEarned;
  let paymentsMade = 0;
  const loans = state.loans.map(loan => {
    if (loan.status !== 'ACTIVE') return loan;
    const paymentCount = Math.min(completedHours, Math.max(0, Math.floor((safeNow - loan.nextDueAt + BANK_SETTLEMENT_MS) / BANK_SETTLEMENT_MS)));
    const paid = safeMoney(Math.min(loan.balance, loan.monthlyPayment * paymentCount));
    if (paid > 0) { cashDelta -= paid; paymentsMade += 1; }
    return { ...loan, balance: safeMoney(loan.balance - paid), nextDueAt: loan.nextDueAt + paymentCount * BANK_SETTLEMENT_MS, status: loan.balance - paid <= 0 ? 'PAID' as const : loan.status };
  });
  const offers = offersForSettlement(state, safeNow, netWorth);
  const next: BankState = { ...state, loans, offers, lastSettlementAt: last + completedHours * BANK_SETTLEMENT_MS, totalInterestEarned: safeMoney(state.totalInterestEarned + interestEarned), totalInterestPaid: safeMoney(state.totalInterestPaid + Math.max(0, -cashDelta)), lastAwaySummary: { interestEarned, paymentsMade, newOffers: offers.length, at: safeNow }, lastOfferSequence: state.lastOfferSequence + 1, ficoScore: clamp(state.ficoScore + (paymentsMade > 0 ? 1 : 0), 300, 850) };
  return { state: next, cashDelta: Number(cashDelta.toFixed(2)), interestEarned, paymentsMade, newOffers: offers.length, completedHours };
}

export function money(value: number): string { return `$${Math.max(0, Number.isFinite(value) ? value : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
export function sanitizeBankState(input: unknown, now = Date.now()): BankState { const base = defaultBankState(now); if (!input || typeof input !== 'object') return base; const raw = input as Partial<BankState>; return { ...base, ...raw, schemaVersion: 1, savingsBalance: Math.max(0, Number(raw.savingsBalance) || 0), businessCheckingBalance: Math.max(0, Number(raw.businessCheckingBalance) || 0), ficoScore: clamp(Number(raw.ficoScore) || 680, 300, 850), loans: Array.isArray(raw.loans) ? raw.loans : [], investors: Array.isArray(raw.investors) ? raw.investors : [], offers: Array.isArray(raw.offers) ? raw.offers : [], lastSettlementAt: Number(raw.lastSettlementAt) || now };
}
