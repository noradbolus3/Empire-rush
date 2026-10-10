import { BankDeposit, BankLedgerEntry, BankLoan, BankMarketEvent, BankOffer, BankRival, BankState, DepositProduct, InsuranceProduct, LoanProduct, TaxRecord, defaultBankState } from '../types/bank';
import type { BusinessEntity } from '../types/business';

export const PRIME_RATE = 6.5;
export const BANK_SETTLEMENT_MS = 60 * 60 * 1000;
export const MAX_BANK_OFFLINE_HOURS = 24;
export const MICROLOAN_TOTAL_CAP = 50_000;

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

export function totalDebtCap(state: BankState, netWorth: number, hourlyIncome: number): number { const tier = bankTier(netWorth).tier; const tierBase: Record<string, number> = { Basic: 25_000, Silver: 100_000, Gold: 500_000, Platinum: 2_500_000, Private: 10_000_000 }; const annualIncome = Math.max(0, hourlyIncome) * 24 * 365; return Math.max(tierBase[tier] || 25_000, Math.min(50_000_000, Math.max(0, netWorth) * 1.5 + annualIncome * 0.35)); }
export function activeDebtByProduct(state: BankState, product: LoanProduct): number { return state.loans.filter(loan => loan.status === 'ACTIVE' && loan.product === product).reduce((sum, loan) => sum + Math.max(0, loan.balance), 0); }

export function underwriteLoan(state: BankState, product: LoanProduct, requested: number, netWorth: number, hourlyIncome: number): { decision: 'APPROVE' | 'COUNTER' | 'DECLINE'; amount: number; apr: number; reason: string } {
  const spec = loanProduct(product);
  const productCap = product === 'SBA_MICROLOAN' ? MICROLOAN_TOTAL_CAP : spec.max;
  const outstandingProduct = activeDebtByProduct(state, product);
  const remainingProduct = Math.max(0, productCap - outstandingProduct);
  const amount = clamp(requested, 0, Math.min(spec.max, remainingProduct));
  if (remainingProduct <= 0) return { decision: 'DECLINE', amount: 0, apr: bankApr(state.ficoScore, product), reason: `${spec.name} cap reached: ${money(productCap)} total outstanding is allowed for this product.` };
  if (requested > remainingProduct) return { decision: 'DECLINE', amount: 0, apr: bankApr(state.ficoScore, product), reason: `Request exceeds the remaining ${spec.name} capacity of ${money(remainingProduct)} (${money(productCap)} total cap).` };
  const debt = state.loans.filter(loan => loan.status === 'ACTIVE').reduce((sum, loan) => sum + loan.balance, 0);
  const annualizedIncome = Math.max(0, hourlyIncome) * 24 * 30;
  const starterProduct = product === 'SBA_MICROLOAN' || product === 'SBA_STARTUP';
  const dti = annualizedIncome > 0 ? debt / annualizedIncome : 0;
  const apr = bankApr(state.ficoScore, product, dti, starterProduct || product === 'COMMERCIAL_MORTGAGE' || product === 'EQUIPMENT_FINANCE');
  if (amount <= 0) return { decision: 'DECLINE', amount: 0, apr, reason: 'Enter an amount above $0.' };
  if (state.ficoScore < 580) return { decision: 'DECLINE', amount: 0, apr, reason: 'FICO below 580. Pay down balances and rebuild payment history.' };
  const capacity = Math.max(spec.max * 0.1, netWorth * (product === 'SBA_MICROLOAN' ? 0.35 : 1.5));
  const remainingDebt = Math.max(0, totalDebtCap(state, netWorth, hourlyIncome) - debt);
  if (remainingDebt <= 0) return { decision: 'DECLINE', amount: 0, apr, reason: `Total debt cap reached at ${money(totalDebtCap(state, netWorth, hourlyIncome))}; pay down an active balance before borrowing again.` };
  if (amount > Math.min(capacity, remainingDebt)) return { decision: 'COUNTER', amount: safeMoney(Math.min(capacity, remainingDebt)), apr, reason: `Debt capacity allows ${money(Math.min(capacity, remainingDebt))} more; total debt cap is ${money(totalDebtCap(state, netWorth, hourlyIncome))}.` };
  if (!starterProduct && dti > 0.65) return { decision: 'DECLINE', amount: 0, apr, reason: 'Debt-to-income is above the bank limit for this larger loan.' };
  return { decision: 'APPROVE', amount, apr, reason: starterProduct && annualizedIncome === 0 ? 'Approved on starter collateral, net-worth capacity, and FICO tier; income is not required for this product.' : 'Approved with current FICO, collateral, cashflow, and debt-to-income.' };
}

export function createLoan(state: BankState, product: LoanProduct, amount: number, apr: number, now: number, termMonths?: number, collateral?: { id: string; name: string }): BankLoan {
  const spec = loanProduct(product);
  const principal = safeMoney(amount);
  const term = Math.max(1, Math.floor(termMonths || spec.termMonths));
  return { id: `loan-${now}-${state.loans.length}`, product, name: spec.name, principal, balance: principal, apr, termMonths: term, monthlyPayment: monthlyPayment(principal, apr, term), nextDueAt: now + BANK_SETTLEMENT_MS * 24 * 30, originationFee: safeMoney(principal * spec.fee / 100), collateral: collateral ? `${collateral.name} · locked` : spec.collateral, collateralAssetId: collateral?.id, collateralAssetName: collateral?.name, status: 'ACTIVE', hardInquiry: true, graceDays: 7, delinquencyDays: 0 };
}

export function offersForSettlement(state: BankState, now: number, netWorth: number): BankOffer[] {
  const seq = state.lastOfferSequence + 1;
  const base = [
    { id: `offer-loan-${seq}`, kind: 'LOAN' as const, title: 'Pre-approved SBA Microloan', detail: 'Reachable early-game capital with a capped balance.', amount: Math.min(50_000, Math.max(5_000, netWorth * 0.35)), rate: bankApr(state.ficoScore, 'SBA_MICROLOAN') },
    { id: `offer-investor-${seq}`, kind: 'INVESTOR' as const, title: 'Investor meeting available', detail: 'Pitch a fictional seed fund against your growth.', amount: Math.max(25_000, netWorth * 0.75) },
    { id: `offer-savings-${seq}`, kind: 'SAVINGS' as const, title: 'Boosted savings window', detail: 'Earn 5.25% APY until the next settlement cycle.', rate: 5.25 },
  ];
  return base.map(item => ({ ...item, expiresAt: now + BANK_SETTLEMENT_MS * 2 }));
}

export function creditBreakdown(state: BankState): { paymentHistory: number; utilization: number; historyLength: number; newCredit: number; creditMix: number; score: number; tier: string; pointsToVeryGood: number } { const active = state.loans.filter(l => l.status === 'ACTIVE'); const paymentHistory = active.some(l => l.delinquencyDays > 0) ? 55 : state.totalInterestPaid > 0 ? 86 : 72; const utilization = clamp(100 - active.reduce((n, l) => n + l.balance, 0) / Math.max(1, state.savingsBalance + 25_000) * 100, 0, 100); const historyLength = clamp(40 + state.creditHistory.length, 0, 100); const newCredit = clamp(100 - active.filter(l => l.hardInquiry).length * 8, 0, 100); const creditMix = clamp(45 + (state.deposits.length ? 15 : 0) + (state.investors.length ? 10 : 0), 0, 100); const weighted = paymentHistory * .35 + utilization * .3 + historyLength * .15 + newCredit * .1 + creditMix * .1; const score = clamp(Math.round(300 + weighted * 5.5), 300, 850); const tier = score < 580 ? 'Poor' : score < 670 ? 'Fair' : score < 740 ? 'Good' : score < 800 ? 'Very Good' : 'Exceptional'; return { paymentHistory, utilization, historyLength, newCredit, creditMix, score, tier, pointsToVeryGood: Math.max(0, 740 - score) }; }
export function depositSpec(product: DepositProduct): { name: string; termDays: number; rate: number; penalty: number } { const specs: Record<DepositProduct, { name: string; termDays: number; rate: number; penalty: number }> = { CD_3M: { name: '3-month CD', termDays: 3, rate: 4.5, penalty: 0.9 }, CD_6M: { name: '6-month CD', termDays: 6, rate: 4.75, penalty: 1.2 }, CD_12M: { name: '12-month CD', termDays: 12, rate: 5.1, penalty: 1.5 }, RETIREMENT_IRA: { name: 'IRA-style retirement account', termDays: 365, rate: 5.25, penalty: 0.1 }, TREASURY_BILL: { name: 'Treasury Bill', termDays: 4, rate: 4.2, penalty: 0 }, TREASURY_NOTE: { name: 'Treasury Note', termDays: 30, rate: 4.35, penalty: 0 }, TREASURY_BOND: { name: 'Treasury Bond', termDays: 90, rate: 4.6, penalty: 0 } }; return specs[product]; }
export function openDeposit(product: DepositProduct, principal: number, now: number): BankDeposit { const spec = depositSpec(product); return { id: `deposit-${now}-${product}`, product, name: spec.name, principal: safeMoney(principal), rate: spec.rate, termDays: spec.termDays, openedAt: now, maturesAt: now + spec.termDays * 24 * 60 * 60 * 1000, earlyPenaltyRate: spec.penalty, status: 'ACTIVE' }; }
export function insuranceSpec(product: InsuranceProduct): { name: string; premium: number; deductible: number; coverage: number } { return ({ GENERAL_LIABILITY: { name: 'General liability', premium: 75, deductible: 500, coverage: 25_000 }, PROPERTY: { name: 'Property', premium: 110, deductible: 1_000, coverage: 50_000 }, COMMERCIAL_AUTO: { name: 'Commercial auto', premium: 145, deductible: 1_500, coverage: 75_000 }, KEY_PERSON: { name: 'Key-person', premium: 90, deductible: 0, coverage: 100_000 }, CYBER: { name: 'Cyber', premium: 125, deductible: 750, coverage: 60_000 } })[product]; }
export function progressiveFederalTax(income: number): number { const brackets = [[11_600, .10], [47_150, .12], [100_525, .22], [191_950, .24], [243_725, .32], [609_350, .35], [Number.POSITIVE_INFINITY, .37]] as const; let tax = 0; let previous = 0; for (const [limit, rate] of brackets) { const slice = Math.max(0, Math.min(income, limit) - previous); tax += slice * rate; previous = limit; if (income <= limit) break; } return safeMoney(tax); }
export function calculateTax(income: number, deductions: number, capitalGains: number, payroll: number, stateRate = .045): TaxRecord { const taxable = Math.max(0, income - deductions); const federal = progressiveFederalTax(taxable); const state = safeMoney(taxable * stateRate); const payrollTax = safeMoney(payroll * .0765); return { id: `tax-${new Date().getFullYear()}`, year: new Date().getFullYear(), income, deductions, federal, state, payroll: payrollTax, capitalGains: safeMoney(capitalGains * .15), paid: 0, dueAt: Date.now() + 90 * 24 * 60 * 60 * 1000, status: 'ESTIMATE' }; }
export function bankEventForTick(tick: number, now: number): BankMarketEvent { const events: BankMarketEvent[] = [{ id: 'rate-hike', kind: 'RATE_HIKE', headline: 'Fed rate hike: borrowing costs rise; savings yields improve.', timestamp: now, primeRate: 7.25, cdRateBump: .55, investorAppetite: -.08 }, { id: 'recession', kind: 'RECESSION', headline: 'Recession warning: margin-call risk rises and investor appetite cools.', timestamp: now, primeRate: 7.75, cdRateBump: .2, investorAppetite: -.25 }, { id: 'funding-boom', kind: 'FUNDING_BOOM', headline: 'Funding boom: investor appetite improves for growing companies.', timestamp: now, primeRate: 6.25, cdRateBump: -.1, investorAppetite: .2 }]; return { ...events[Math.abs(tick) % events.length], timestamp: now }; }
export function achievementIds(state: BankState, netWorth: number): string[] { const ids = new Set(state.achievements); if (state.loans.length) ids.add('FIRST_LOAN'); if (state.loans.length && state.loans.every(l => l.status === 'PAID')) ids.add('DEBT_FREE'); if (state.ficoScore >= 800) ids.add('FICO_800'); if (state.investors.some(i => i.invested >= 1_000_000)) ids.add('FIRST_MILLION_RAISED'); if (netWorth >= 1_000_000_000) ids.add('UNICORN'); if (state.deposits.filter(d => d.status === 'MATURED').length >= 10) ids.add('TEN_CDS_MATURED'); return [...ids]; }
export function addLedger(state: BankState, kind: BankLedgerEntry['kind'], label: string, amount: number, timestamp: number, detail: string): BankState { const entry = { id: `ledger-${timestamp}-${state.ledger.length}`, kind, label, amount: safeMoney(amount), timestamp, detail }; return { ...state, ledger: [...state.ledger, entry].slice(-200) }; }

export function calculateCompanyValuation(businesses: BusinessEntity[], sectorMultiples: Record<string, number> = { Retail: 1.2, Mobility: 1.8, Tech_SaaS: 4, Infrastructure: 2.2, Energy: 2.5, Pharma: 3.2, Media: 2, Sports: 2.4, Airline: 1.6, Real_Estate: 2.8 }): number { return safeMoney(businesses.filter(item => item.isAcquired).reduce((sum, item) => { const revenue = Math.max(0, Number(item.hourlyNetProfit) || 0) * 24 * 365; const multiple = sectorMultiples[item.sector] || 1.5; const assets = Math.max(0, Number(item.acquisitionCost) || 0) + Math.max(0, Number(item.pendingSettlementAmount) || 0); return sum + revenue * multiple + assets; }, 0)); }

export function seedRivals(now: number, playerNetWorth: number): BankRival[] { return [{ id: 'rival-atlas', name: 'Atlas Reed', netWorth: Math.max(10_000, playerNetWorth * 0.9), growthRate: 0.018, volatility: 0.012, lastUpdatedAt: now }, { id: 'rival-maya', name: 'Maya Chen', netWorth: Math.max(7_500, playerNetWorth * 0.7), growthRate: 0.024, volatility: 0.018, lastUpdatedAt: now }, { id: 'rival-jordan', name: 'Jordan Vale', netWorth: Math.max(5_000, playerNetWorth * 0.5), growthRate: 0.031, volatility: 0.025, lastUpdatedAt: now }, { id: 'rival-nia', name: 'Nia Brooks', netWorth: Math.max(12_000, playerNetWorth * 1.1), growthRate: 0.012, volatility: 0.009, lastUpdatedAt: now }, { id: 'rival-diego', name: 'Diego Santos', netWorth: Math.max(9_000, playerNetWorth * 0.8), growthRate: 0.021, volatility: 0.02, lastUpdatedAt: now }]; }
export function advanceRivals(rivals: BankRival[], now: number, hours: number): BankRival[] { return rivals.map((rival, index) => { const phase = Math.sin((now / BANK_SETTLEMENT_MS) + index * 1.7); const hourly = rival.growthRate + phase * rival.volatility; return { ...rival, netWorth: safeMoney(Math.max(0, rival.netWorth * Math.max(0.9, 1 + hourly * Math.max(1, hours)))), lastUpdatedAt: now }; }); }
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
  let maturityCash = 0;
  const deposits = state.deposits.map(deposit => {
    if (deposit.status === 'ACTIVE' && safeNow >= deposit.maturesAt) {
      maturityCash += safeMoney(deposit.principal * (1 + deposit.rate / 100 * deposit.termDays / 365));
      return { ...deposit, status: 'MATURED' as const };
    }
    return deposit;
  });
  cashDelta += maturityCash;
  const event = bankEventForTick(Math.floor(safeNow / BANK_SETTLEMENT_MS), safeNow);
  const eventPayout = event.kind === 'RECESSION' ? state.insurance.filter(policy => policy.active).reduce((sum, policy) => sum + Math.max(0, policy.coverage - policy.deductible) * 0.02, 0) : 0;
  cashDelta += safeMoney(eventPayout);
  const offers = offersForSettlement(state, safeNow, netWorth);
  const next: BankState = { ...state, loans, deposits, marketEvents: [...state.marketEvents, event].slice(-24), offers, rivals: advanceRivals(state.rivals?.length ? state.rivals : seedRivals(safeNow, netWorth), safeNow, completedHours), lastSettlementAt: last + completedHours * BANK_SETTLEMENT_MS, totalInterestEarned: safeMoney(state.totalInterestEarned + interestEarned), totalInterestPaid: safeMoney(state.totalInterestPaid + Math.max(0, -cashDelta)), lastAwaySummary: { interestEarned, paymentsMade, newOffers: offers.length, at: safeNow }, lastOfferSequence: state.lastOfferSequence + 1, ficoScore: clamp(state.ficoScore + (paymentsMade > 0 ? 1 : 0), 300, 850) };
  return { state: next, cashDelta: Number(cashDelta.toFixed(2)), interestEarned, paymentsMade, newOffers: offers.length, completedHours };
}

export function money(value: number): string { return `$${Math.max(0, Number.isFinite(value) ? value : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
export function sanitizeBankState(input: unknown, now = Date.now()): BankState { const base = defaultBankState(now); if (!input || typeof input !== 'object') return base; const raw = input as Partial<BankState>; return { ...base, ...raw, schemaVersion: 2, savingsBalance: Math.max(0, Number(raw.savingsBalance) || 0), businessCheckingBalance: Math.max(0, Number(raw.businessCheckingBalance) || 0), ficoScore: clamp(Number(raw.ficoScore) || 680, 300, 850), loans: Array.isArray(raw.loans) ? raw.loans : [], investors: Array.isArray(raw.investors) ? raw.investors : [], offers: Array.isArray(raw.offers) ? raw.offers : [], creditHistory: Array.isArray(raw.creditHistory) ? raw.creditHistory : base.creditHistory, deposits: Array.isArray(raw.deposits) ? raw.deposits : [], insurance: Array.isArray(raw.insurance) ? raw.insurance : [], taxRecords: Array.isArray(raw.taxRecords) ? raw.taxRecords : [], ledger: Array.isArray(raw.ledger) ? raw.ledger : [], achievements: Array.isArray(raw.achievements) ? raw.achievements : [], loginStreak: Math.max(1, Number(raw.loginStreak) || 1), lastLoginAt: Number(raw.lastLoginAt) || now, weeklyInterestEarned: Math.max(0, Number(raw.weeklyInterestEarned) || 0), marketEvents: Array.isArray(raw.marketEvents) ? raw.marketEvents : [], companyValuation: Math.max(0, Number(raw.companyValuation) || 0), rivals: Array.isArray(raw.rivals) ? raw.rivals : [], acceptedOfferIds: Array.isArray(raw.acceptedOfferIds) ? raw.acceptedOfferIds : [], savingsRateBoostUntil: Math.max(0, Number(raw.savingsRateBoostUntil) || 0), lastSettlementAt: Number(raw.lastSettlementAt) || now }; }
