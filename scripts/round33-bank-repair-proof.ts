// @ts-nocheck
import assert from 'node:assert/strict';
import { canAcceptOffer, createLoan, isActiveLoan, payOffLoan, seizeDefaultedLoan, totalDebt, underwriteLoan } from '../src/engine/bankEngine';
import { calculateNetWorth, settleHour } from '../src/engine/financialCore';

const now = 1_800_000_000_000;
const baseBank: any = { schemaVersion: 2, savingsBalance: 0, businessCheckingBalance: 0, deposits: [], loans: [], insurance: [], investors: [], offers: [], acceptedOfferIds: [], taxRecords: [], creditHistory: [], marketEvents: [], achievements: [], rivals: [], ficoScore: 700, totalCreditLimit: 25000, hardInquiries: 0, accountOpenedAt: now - 86400000 * 365, ledger: [], lastSettlementAt: now };
const base: any = { cash: 1000, bank: baseBank, assets: [], holdings: {}, owned: [], lifestyleAssets: [], businesses: [{ id: 'b1', name: 'Proof Retail', isAcquired: true, hourlyNetProfit: 100, acquisitionCost: 1000, pendingSettlementAmount: 0 }], systemTimeMs: now };
const print = (name: string, value: unknown) => console.log(`\n[${name}]\n${JSON.stringify(value, null, 2)}`);

const beforeNW = calculateNetWorth(base);
const decision = underwriteLoan(baseBank, 'SBA_MICROLOAN', 5000, beforeNW, 0);
assert.equal(decision.decision, 'APPROVE');
const loan = createLoan(baseBank, 'SBA_MICROLOAN', 5000, decision.apr, now);
const afterLoan: any = { ...base, cash: base.cash + loan.principal - loan.originationFee, bank: { ...baseBank, loans: [loan], ledger: [{ id: 'loan', kind: 'LOAN', label: 'SBA Microloan funded', amount: 5000 - loan.originationFee }] } };
print('a loan origination', { before: { cash: base.cash, debt: 0, netWorth: beforeNW, headerIncome: settleHour(base).projectedHourlyNet }, after: { cash: afterLoan.cash, debt: totalDebt(afterLoan.bank), netWorth: calculateNetWorth(afterLoan), headerIncome: settleHour(afterLoan).projectedHourlyNet, ledger: afterLoan.bank.ledger } });
assert.equal(totalDebt(afterLoan.bank), 5000);
assert.equal(calculateNetWorth(afterLoan), beforeNW - loan.originationFee);
assert(settleHour(afterLoan).projectedHourlyNet < settleHour(base).projectedHourlyNet);

const cappedBank: any = { ...baseBank, loans: [{ ...loan, balance: 50000, principal: 50000 }] };
const capDecision = underwriteLoan(cappedBank, 'SBA_MICROLOAN', 1, 100000, 100);
print('b microloan cumulative cap', capDecision);
assert.equal(capDecision.decision, 'DECLINE');
assert.match(capDecision.reason, /cap/i);

const paid = payOffLoan(afterLoan.bank, loan.id, 10000, now + 1);
print('c pay off with enough cash', { ok: paid.ok, cashBefore: 10000, cashAfter: paid.cash, debtAfter: totalDebt(paid.state), status: paid.state.loans[0].status, ledger: paid.ledgerEntry });
assert.equal(paid.ok, true);
assert.equal(totalDebt(paid.state), 0);
const blocked = payOffLoan(afterLoan.bank, loan.id, 1, now + 2);
print('c pay off with insufficient cash', blocked);
assert.equal(blocked.ok, false);

const seized = seizeDefaultedLoan(afterLoan.bank, loan.id, now + 3);
print('d default seizure', { status: seized.state.loans[0].status, debtAfter: totalDebt(seized.state), ficoAfter: seized.state.ficoScore, collateralUnlocked: seized.collateralAssetId, ledger: seized.ledgerEntry });
assert.equal(seized.state.loans[0].status, 'foreclosed');
assert.equal(totalDebt(seized.state), 0);
assert(seized.state.ficoScore < afterLoan.bank.ficoScore);

const expired: any = { id: 'expired', kind: 'LOAN', title: 'Expired loan', detail: 'expired', expiresAt: now - 1 };
const offerGate = canAcceptOffer(expired, now);
print('e expired offer', offerGate);
assert.equal(offerGate.ok, false);

const settlement = settleHour(afterLoan);
print('f itemized settlement tick', { cashDelta: settlement.cashDelta, projectedHourlyNet: settlement.projectedHourlyNet, breakdown: settlement.breakdown, ledger: settlement.ledger });
assert(settlement.ledger.some(item => item.kind === 'BUSINESS_REVENUE'));
assert(settlement.ledger.some(item => item.kind === 'EMI'));
assert(Number.isFinite(settlement.projectedHourlyNet));

console.log('\nROUND 33 RAW PROOF: all scenarios passed');
