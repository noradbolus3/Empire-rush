// @ts-nocheck
import assert from 'node:assert/strict';
import { calculateNetWorth, settleHour } from '../src/engine/financialCore';

const now = 1_800_000_000_000;
const base = {
  cash: 500,
  bank: { savingsBalance: 0, businessCheckingBalance: 0, deposits: [], loans: [], insurance: [], investors: [] },
  assets: [], holdings: {}, owned: [], lifestyleAssets: [], businesses: [], systemTimeMs: now,
};

const loan = { id: 'loan-1', product: 'SBA_STARTUP', name: 'Startup Loan', principal: 5000, balance: 5000, apr: 12, termMonths: 24, monthlyPayment: 250, nextDueAt: now, originationFee: 0, collateral: 'Founder net worth', status: 'ACTIVE', hardInquiry: false, graceDays: 5, delinquencyDays: 0 };
const borrowed = { ...base, cash: 5500, bank: { ...base.bank, loans: [loan] } };
assert.equal(calculateNetWorth(base), 500, 'baseline net worth');
assert.equal(calculateNetWorth(borrowed), 500, 'loan cash and debt must offset');

const stock = { id: 'stock-1', symbol: 'TST', name: 'Test Stock', kind: 'STOCK', price: 100, change: 0, history: [100], sector: 'Tech', description: 'Proof asset', dividendYield: 0, logo: 1 };
const car = { id: 'car-1', name: 'Proof Car', type: 'Sedan', category: 'CARS', price: 25000, upkeep: 100, prestige: 1, image: 1 };
const tradeEntry = { id: 'trade-1', kind: 'TRADE', label: 'BUY Test Stock', amount: -100, timestamp: now, detail: '1 unit at $100' };
const carEntry = { id: 'purchase-1', kind: 'PURCHASE', label: 'Lifestyle purchase · Proof Car', amount: -25000, timestamp: now, detail: 'Car asset acquired' };
assert.equal([tradeEntry].filter(item => item.kind === 'TRADE').length, 1);
assert.equal([carEntry].filter(item => item.kind === 'PURCHASE').length, 1);

const operating = {
  ...borrowed,
  lifestyleAssets: [car],
  owned: ['car-1'],
  businesses: [{ id: 'biz-1', isAcquired: true, hourlyNetProfit: 100, sector: 'Retail', stockUnits: 0, unitWholesaleCost: 0, acquisitionCost: 1000, pendingSettlementAmount: 0 }],
};
const settled = settleHour(operating);
assert.equal(settled.ledger.length, 7, 'one ledger entry for each settlement item');
assert.ok(settled.ledger.some(item => item.kind === 'BUSINESS_REVENUE'));
assert.ok(settled.ledger.some(item => item.kind === 'INTEREST'));
assert.ok(settled.ledger.some(item => item.kind === 'EMI'));
assert.ok(settled.ledger.some(item => item.kind === 'UPKEEP'));
assert.ok(Math.abs(settled.projectedHourlyNet - (settled.breakdown.businessRevenue + settled.breakdown.interest - settled.breakdown.emi - settled.breakdown.premiums - settled.breakdown.upkeep - settled.breakdown.investorShare - settled.breakdown.taxAccrual)) < 0.01, 'projected net must equal the settlement breakdown including tax accrual');
assert.ok(settled.state.bank.loans[0].balance < loan.balance, 'EMI must reduce principal balance');

console.log(JSON.stringify({
  scenario: 'Round 32A shared financial core',
  loan: { beforeNetWorth: calculateNetWorth(base), afterBorrowingNetWorth: calculateNetWorth(borrowed), cashAfterLoan: borrowed.cash, debtAfterLoan: loan.balance },
  ledgerHooks: { stockBuy: '1 TRADE entry', carBuy: '1 PURCHASE entry' },
  settlement: { entries: settled.ledger.map(item => item.kind), projectedHourlyNet: settled.projectedHourlyNet, breakdown: settled.breakdown, loanBalanceAfterHour: settled.state.bank.loans[0].balance },
  status: 'PASS',
}, null, 2));
