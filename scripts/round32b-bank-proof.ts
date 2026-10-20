// @ts-nocheck
import assert from 'node:assert/strict';
import { activeDebtByProduct, calculateCompanyValuation, createLoan, loanProduct, offersForSettlement, seedRivals, totalDebtCap, underwriteLoan } from '../src/engine/bankEngine';

const now = 1_800_000_000_000;
const state = { schemaVersion: 2, savingsBalance: 0, businessCheckingBalance: 0, overdraftProtection: true, ficoScore: 700, totalInterestEarned: 0, totalInterestPaid: 0, loans: [], investors: [], offers: [], lastSettlementAt: now, lastAwaySummary: null, lastOfferSequence: 0, creditHistory: [], deposits: [], insurance: [], taxRecords: [], ledger: [], achievements: [], loginStreak: 1, lastLoginAt: now, weeklyInterestEarned: 0, marketEvents: [], companyValuation: 0, rivals: [], acceptedOfferIds: [], savingsRateBoostUntil: 0 };

const starter = underwriteLoan(state, 'SBA_MICROLOAN', 5_000, 0, 0);
assert.equal(starter.decision, 'APPROVE', 'starter microloan must be approvable without income');
const micro = createLoan(state, 'SBA_MICROLOAN', starter.amount, starter.apr, now, 36, { id: 'car-1', name: 'Proof Car' });
assert.equal(micro.collateralAssetId, 'car-1');
assert.match(micro.collateral, /locked/);
const cappedState = { ...state, loans: Array.from({ length: 1 }, (_, index) => ({ ...micro, id: `micro-${index}`, balance: 50_000 })) };
const capDecision = underwriteLoan(cappedState, 'SBA_MICROLOAN', 1_000, 0, 0);
assert.equal(capDecision.decision, 'DECLINE');
assert.ok(capDecision.reason.includes('cap'));
assert.ok(totalDebtCap(state, 0, 0) >= 25_000);

const businesses = [
  { id: 'small', isAcquired: true, hourlyNetProfit: 100, sector: 'Retail', acquisitionCost: 10_000, pendingSettlementAmount: 0 },
  { id: 'large', isAcquired: true, hourlyNetProfit: 1_000, sector: 'Tech_SaaS', acquisitionCost: 50_000, pendingSettlementAmount: 0 },
];
const valuation = calculateCompanyValuation(businesses);
assert.ok(valuation > 0);
const rivals = seedRivals(now, valuation);
assert.equal(rivals.length, 5);
assert.notEqual(rivals[0].growthRate, rivals[1].growthRate);
const offers = offersForSettlement(state, now, valuation);
assert.equal(offers.length, 3);
assert.ok((offers.find(item => item.kind === 'SAVINGS')?.rate || 0) > 4.25);
assert.ok(offers.every(item => Number(item.expiresAt) > now));

console.log(JSON.stringify({
  scenario: 'Round 32B loans, accounts, investors, leaderboard',
  starterLoan: { decision: starter.decision, amount: starter.amount, apr: starter.apr, collateral: micro.collateral },
  capGuard: { decision: capDecision.decision, reason: capDecision.reason, microloanOutstanding: activeDebtByProduct(cappedState, 'SBA_MICROLOAN'), totalDebtCap: totalDebtCap(state, 0, 0) },
  companyValuation: valuation,
  rivals: rivals.map(item => ({ name: item.name, netWorth: item.netWorth, growthRate: item.growthRate, volatility: item.volatility })),
  offers: offers.map(item => ({ kind: item.kind, amount: item.amount, rate: item.rate, expiresAt: item.expiresAt })),
  status: 'PASS',
}, null, 2));
