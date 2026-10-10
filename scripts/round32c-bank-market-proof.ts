// @ts-nocheck
import assert from 'node:assert/strict';
import { creditBreakdown, calculateTax, openDeposit, withdrawDeposit } from '../src/engine/bankEngine';
import { settleHour, calculateNetWorth } from '../src/engine/financialCore';

const now = 1_800_000_000_000;
const baseBank = {
  savingsBalance: 10000, businessCheckingBalance: 0, deposits: [], loans: [], insurance: [{ id: 'p1', product: 'GENERAL_LIABILITY', name: 'General liability', premium: 25, deductible: 100, coverage: 10000, active: true, purchasedAt: now, lastPaidAt: now }], investors: [{ id: 'i1', name: 'Northline Ventures', equityPercent: 10, invested: 1000, profitShare: 10, round: 'SEED', instrument: 'SAFE' }], savingsRateBoostUntil: 0, taxRecords: [], marketEvents: [], creditHistory: [{ timestamp: now - 86400000 * 365, score: 680, paymentHistory: 90, utilization: 20, historyLength: 50, newCredit: 90, creditMix: 60 }]
};
const state:any = { cash: 500, bank: baseBank, assets: [{ id: 's1', kind: 'STOCK', price: 100, sector: 'TECH', symbol: 'NOVA', name: 'Nova' }], holdings: {}, owned: [], lifestyleAssets: [], businesses: [{ id: 'b1', name: 'Copper & Bloom', isAcquired: true, hourlyNetProfit: 500, acquisitionCost: 10000, pendingSettlementAmount: 0 }], systemTimeMs: now, multiplier: 1 };
const score = creditBreakdown({ ...baseBank, accountOpenedAt: now - 86400000 * 365, totalCreditLimit: 25000, hardInquiries: 0 } as any);
assert(score.score >= 300 && score.score <= 850);
assert.equal(calculateTax(100000, 10000, 5000, 20000).payroll, 1530);
const early = openDeposit('CD_3M', 1000, now);
const withdrawal = withdrawDeposit(early, now + 86400000);
assert(withdrawal.amount < 1000 && withdrawal.penalty > 0);
const mature = withdrawDeposit(early, early.maturesAt + 1);
assert(mature.amount > 1000 && mature.penalty === 0);
const result = settleHour({ ...state, bank: { ...baseBank, marketEvents: [{ id: 'r', kind: 'RECESSION', headline: 'Recession', primeRate: 7.75, cdRateBump: 0.2, investorAppetite: -0.25, timestamp: now }] } });
assert(result.ledger.some(item => item.kind === 'TAX'));
assert(result.ledger.some(item => item.kind === 'PREMIUM'));
assert(result.ledger.some(item => item.kind === 'INSURANCE'));
assert(Number.isFinite(result.projectedHourlyNet));
assert(result.breakdown.taxAccrual > 0);
const worth = calculateNetWorth(state);
console.log(JSON.stringify({ status: 'PASS', fico: score, tax: calculateTax(100000, 10000, 5000, 20000), deposit: { early: withdrawal, mature }, settlement: { cashDelta: result.cashDelta, projectedHourlyNet: result.projectedHourlyNet, ledgerKinds: result.ledger.map(item => item.kind) }, netWorth: worth }, null, 2));
