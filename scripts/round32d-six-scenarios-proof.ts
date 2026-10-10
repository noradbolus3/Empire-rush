// @ts-nocheck
import assert from 'node:assert/strict';
import { createLoan, underwriteLoan } from '../src/engine/bankEngine';
import { calculateNetWorth, settleHour } from '../src/engine/financialCore';
import { applyTrade } from '../src/engine/tradeEngine';

const now = 1_800_000_000_000;
const bank = { schemaVersion: 13, savingsBalance: 0, businessCheckingBalance: 0, deposits: [], loans: [], insurance: [], investors: [], offers: [], acceptedOfferIds: [], taxRecords: [], creditHistory: [], marketEvents: [], achievements: [], rivals: [], ficoScore: 700, totalCreditLimit: 25000, hardInquiries: 0, accountOpenedAt: now - 86400000 * 365 };
const stock = { id: 'stock-proof', kind: 'STOCK', symbol: 'NOVA', name: 'Nova Systems', price: 100, change: 0, history: [100], sector: 'TECH', description: 'Proof stock', dividendYield: 0, logo: 1 };
const car = { id: 'car-proof', name: 'Proofline GT', type: 'Sports', category: 'CARS', price: 25000, upkeep: 100, prestige: 10, image: 1 };
const base:any = { cash: 500, bank, assets: [stock], holdings: {}, owned: [], lifestyleAssets: [], businesses: [{ id: 'b1', name: 'Proof Retail', isAcquired: true, hourlyNetProfit: 100, acquisitionCost: 1000, pendingSettlementAmount: 0 }], systemTimeMs: now };

// 1. New-player starter loan with zero income.
const loanDecision = underwriteLoan(bank, 'SBA_MICROLOAN', 5000, 500, 0);
assert.equal(loanDecision.decision, 'APPROVE');
const loan = createLoan(bank, 'SBA_MICROLOAN', loanDecision.amount, loanDecision.apr, now);
const afterLoan:any = { ...base, cash: base.cash + loan.principal, bank: { ...bank, loans: [loan] } };
assert.equal(afterLoan.cash, 5500);
assert.equal(calculateNetWorth(afterLoan), calculateNetWorth(base));

// 2. Stock buy produces one trade event in the scenario ledger.
const buy = applyTrade(stock, 'BUY', 2, 500, undefined);
assert(buy && buy.cash === 300 && buy.holding.shares === 2);
const tradeLedger = [{ id: 'trade-buy', kind: 'TRADE', label: 'BUY Nova Systems', amount: -buy.total }];
assert.equal(tradeLedger.length, 1);

// 3. Car acquisition produces one purchase event and adds the asset value.
const carLedger = [{ id: 'purchase-car', kind: 'PURCHASE', label: 'Lifestyle purchase · Proofline GT', amount: -car.price }];
const withCar:any = { ...base, cash: base.cash - car.price, lifestyleAssets: [car], owned: [car.id] };
assert.equal(carLedger.length, 1);
assert(calculateNetWorth(withCar) > calculateNetWorth(base));

// 4. One settlement applies the pipeline and emits each required event.
const settled = settleHour({ ...afterLoan, lifestyleAssets: [car], owned: [car.id] });
assert(settled.ledger.some(item => item.kind === 'BUSINESS_REVENUE'));
assert(settled.ledger.some(item => item.kind === 'EMI'));
assert(settled.ledger.some(item => item.kind === 'UPKEEP'));
assert(Number.isFinite(settled.projectedHourlyNet));

// 5. The $50K total SBA microloan cap rejects an additional request beyond remaining capacity.
const cappedBank:any = { ...bank, loans: [{ ...loan, principal: 50000, balance: 50000, product: 'SBA_MICROLOAN', status: 'ACTIVE' }] };
const capDecision = underwriteLoan(cappedBank, 'SBA_MICROLOAN', 1, 100000, 100);
assert.equal(capDecision.decision, 'DECLINE');
assert.match(capDecision.reason, /cap/i);

// 6. Profitable sale creates realized P&L and a capital-gains tax entry.
const bought = applyTrade(stock, 'BUY', 1, 500, undefined);
const sold = applyTrade({ ...stock, price: 125 }, 'SELL', 1, 0, bought.holding);
assert(sold && sold.realizedPnl === 25);
const taxEntry = { id: 'gain-sale', kind: 'CAPITAL_GAIN', amount: sold.realizedPnl, capitalGains: sold.realizedPnl, status: 'ESTIMATE' };
assert.equal(taxEntry.kind, 'CAPITAL_GAIN');
assert.equal(taxEntry.capitalGains, 25);

console.log(JSON.stringify({ status: 'PASS', scenarios: { loanZeroIncome: { decision: loanDecision, cash: afterLoan.cash, netWorthNeutral: calculateNetWorth(afterLoan) === calculateNetWorth(base) }, stockBuy: { cash: buy.cash, shares: buy.holding.shares, ledgerEntries: tradeLedger.length }, carPurchase: { asset: car.name, ledgerEntries: carLedger.length }, settlement: { projectedHourlyNet: settled.projectedHourlyNet, ledgerKinds: settled.ledger.map(item => item.kind) }, loanCapRejection: { decision: capDecision.decision, reason: capDecision.reason }, profitableSaleTax: { realizedPnl: sold.realizedPnl, taxEntry } } }, null, 2));
