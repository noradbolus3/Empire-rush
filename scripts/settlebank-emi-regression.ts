import assert from "node:assert/strict";
import { createLoan, settleBank, underwriteLoan } from "../src/engine/bankEngine";
import { defaultBankState } from "../src/types/bank";

const HOUR = 3600000;
const start = 1_800_000_000_000;
const initial = defaultBankState(start);
const decision = underwriteLoan(initial, "SBA_MICROLOAN", 5_000, 2_000, 0);
assert.equal(decision.decision, "APPROVE");
const loan = createLoan(initial, "SBA_MICROLOAN", 5_000, decision.apr, start);
let state: any = {
  ...initial,
  loans: [loan],
  lastSettlementAt: start,
};
let payments = 0;
let cashDelta = 0;

for (let hour = 1; hour <= 24 * 30; hour += 1) {
  const result = settleBank(state, start + hour * HOUR, 0);
  payments += result.paymentsMade;
  cashDelta += result.cashDelta;
  state = result.state;
}

assert.equal(payments, 1, `expected one monthly payment, got ${payments}`);
assert.equal(Number(cashDelta.toFixed(2)), Number((-loan.monthlyPayment).toFixed(2)));
assert.equal(state.loans[0].balance, Number((loan.balance - loan.monthlyPayment).toFixed(2)));
assert.equal(
  state.loans[0].nextDueAt,
  loan.nextDueAt + 30 * 24 * HOUR,
  "next due date must advance by one 30-day month",
);

console.log(
  JSON.stringify(
    {
      test: "legacy-settleBank-monthly-emi",
      hourlyCalls: 24 * 30,
      monthlyPayment: loan.monthlyPayment,
      payments,
      balanceAfter: state.loans[0].balance,
      result: "PASS",
    },
    null,
    2,
  ),
);
