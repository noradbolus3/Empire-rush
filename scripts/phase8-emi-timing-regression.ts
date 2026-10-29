import assert from "node:assert/strict";
import { createLoan, settleBank, underwriteLoan } from "../src/engine/bankEngine";
import { defaultBankState } from "../src/types/bank";
import { settleHour, type FinancialGameState } from "../src/engine/financialCore";

const HOUR = 3_600_000;
const MONTH_HOURS = 30 * 24;
const start = 1_800_000_000_000;

function loanFixture(overrides: Record<string, unknown> = {}) {
  const bank = defaultBankState(start);
  const decision = underwriteLoan(bank, "SBA_MICROLOAN", 5_000, 2_000, 0);
  assert.equal(decision.decision, "APPROVE");
  const loan = createLoan(bank, "SBA_MICROLOAN", 5_000, decision.apr, start);
  return {
    ...loan,
    nextDueAt: start + HOUR,
    graceSettlements: 0,
    settlementsElapsed: 0,
    ...overrides,
  } as typeof loan;
}

function bankWith(loan: any, lastSettlementAt = start) {
  return { ...defaultBankState(start), loans: [loan], lastSettlementAt };
}

// Repeated calls at the same timestamp must not double-charge.
{
  const loan = loanFixture();
  const first = settleBank(bankWith(loan), start + HOUR, 0);
  const second = settleBank(first.state, start + HOUR, 0);
  assert.equal(first.paymentsMade, 1);
  assert.equal(second.paymentsMade, 0);
  assert.equal(second.cashDelta, 0);
}

// 720 hourly calls: one payment at hour 1 and one at hour 721, not 30 payments.
{
  const loan = loanFixture();
  let state: any = bankWith(loan);
  let payments = 0;
  for (let hour = 1; hour <= MONTH_HOURS; hour += 1) {
    const result = settleBank(state, start + hour * HOUR, 0);
    payments += result.paymentsMade;
    state = result.state;
  }
  assert.equal(payments, 1);
  assert.equal(state.loans[0].nextDueAt, start + HOUR + MONTH_HOURS * HOUR);
}

// A single long offline call is capped at 24 completed hours but charges only once.
{
  const loan = loanFixture();
  const result = settleBank(bankWith(loan), start + 10 * 24 * HOUR, 0);
  assert.equal(result.completedHours, 24);
  assert.equal(result.paymentsMade, 1);
}

// Grace crossing during offline catch-up: 24 completed hours crosses three grace hours once.
{
  const loan = loanFixture({
    nextDueAt: start + HOUR,
    graceSettlements: 3,
    settlementsElapsed: 0,
  });
  const result = settleBank(bankWith(loan), start + 24 * HOUR, 0);
  assert.equal(result.completedHours, 24);
  assert.equal(result.paymentsMade, 1);
}

// Legacy loan without nextDueAt remains payable once, without an invalid date.
{
  const loan: any = loanFixture();
  delete loan.nextDueAt;
  const result = settleBank(bankWith(loan), start + HOUR, 0);
  assert.equal(result.paymentsMade, 1);
  assert.equal(Number.isFinite(result.state.loans[0].nextDueAt), true);
}

// JSON reload between due dates must not duplicate the payment.
{
  const loan = loanFixture();
  const first = settleBank(bankWith(loan), start + HOUR, 0);
  const reloaded = JSON.parse(JSON.stringify(first.state));
  const sameTimestamp = settleBank(reloaded, start + HOUR, 0);
  assert.equal(sameTimestamp.paymentsMade, 0);
  const nextDue = settleBank(sameTimestamp.state, start + HOUR + MONTH_HOURS * HOUR, 0);
  assert.equal(nextDue.paymentsMade, 1);
}

// If balance is smaller than the scheduled EMI, pay balance plus current interest and close.
{
  const loan = loanFixture({ balance: 50 });
  const result = settleBank(bankWith(loan), start + HOUR, 0);
  const interest = Number(((50 * loan.apr) / 100 / 12).toFixed(2));
  assert.equal(result.paymentsMade, 1);
  assert.equal(result.state.loans[0].balance, 0);
  assert.equal(result.cashDelta, Number(-(50 + interest).toFixed(2)));
}

// Equivalent due loan: legacy helper and active settleHour must agree on cash, balance, and due date.
{
  const loan = loanFixture();
  const legacy = settleBank(bankWith(loan), start + HOUR, 0);
  const financial: FinancialGameState = {
    cash: 1_000,
    bank: bankWith(loan),
    assets: [],
    holdings: {},
    owned: [],
    lifestyleAssets: [],
    businesses: [],
    systemTimeMs: start + HOUR,
  };
  const active = settleHour(financial);
  const activeLoan = active.state.bank.loans[0];
  const legacyLoan = legacy.state.loans[0];
  assert.equal(legacy.cashDelta, active.cashDelta);
  assert.equal(legacyLoan.balance, activeLoan.balance);
  assert.equal(legacyLoan.nextDueAt, activeLoan.nextDueAt);
  assert.equal(legacy.paymentsMade, active.ledger.filter((entry) => entry.kind === "EMI" && entry.amount < 0).length);
  assert.equal(active.breakdown.emi, loan.monthlyPayment);
  assert.equal(
    Number(active.breakdown.loanInterest.toFixed(2)),
    Number(((loan.balance * loan.apr) / 100 / 12).toFixed(2)),
  );
}

console.log(JSON.stringify({
  test: "phase8-emi-timing",
  repeatedTimestamp: "PASS",
  hourly720: "PASS",
  longOfflineCap: "PASS",
  graceOfflineCatchUp: "PASS",
  missingNextDueAt: "PASS",
  jsonReload: "PASS",
  smallBalance: "PASS",
  settleBankVsSettleHour: "PASS",
  result: "PASS",
}, null, 2));
