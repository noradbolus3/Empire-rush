import assert from "node:assert/strict";
import { createLoan, underwriteLoan } from "../src/engine/bankEngine";
import { settleHour } from "../src/engine/financialCore";

const HOUR = 3600000;
const HOURS_PER_MONTH = 24 * 30;
const start = 1_800_000_000_000;

const makeBank = () => ({
  schemaVersion: 2,
  savingsBalance: 0,
  businessCheckingBalance: 0,
  deposits: [],
  loans: [],
  insurance: [],
  investors: [],
  offers: [],
  acceptedOfferIds: [],
  taxRecords: [],
  creditHistory: [],
  marketEvents: [],
  achievements: [],
  rivals: [],
  ficoScore: 700,
  totalCreditLimit: 25_000,
  hardInquiries: 0,
  accountOpenedAt: start - 86400000 * 365,
  ledger: [],
  lastSettlementAt: start,
});

const makeBase = (bank: any) => ({
  cash: 1_000,
  bank,
  assets: [],
  holdings: {},
  owned: [],
  lifestyleAssets: [],
  businesses: [
    {
      id: "b1",
      name: "Proof Retail",
      isAcquired: true,
      hourlyNetProfit: 100,
      acquisitionCost: 1_000,
      pendingSettlementAmount: 0,
    },
  ],
  systemTimeMs: start,
});

const decision = underwriteLoan(makeBank(), "SBA_MICROLOAN", 5_000, 2_000, 0);
assert.equal(decision.decision, "APPROVE");
const initialBank: any = makeBank();
const loan = createLoan(initialBank, "SBA_MICROLOAN", 5_000, decision.apr, start);
const base: any = makeBase(initialBank);

const cashLedgerDelta = (result: ReturnType<typeof settleHour>) =>
  Number(
    result.ledger
      .filter((entry) => entry.kind !== "TAX")
      .reduce((sum, entry) => sum + entry.amount, 0)
      .toFixed(2),
  );

let state: any = { ...base, bank: { ...initialBank, loans: [loan] } };
const hourlyResults: ReturnType<typeof settleHour>[] = [];
for (let hour = 1; hour <= 4; hour += 1) {
  const result = settleHour(state);
  hourlyResults.push(result);
  assert.equal(
    cashLedgerDelta(result),
    result.cashDelta,
    `hour ${hour}: cash delta must reconcile with non-tax ledger entries`,
  );
  if (hour <= loan.graceSettlements!) {
    assert.equal(result.breakdown.emi, 0, `hour ${hour}: grace EMI must be zero`);
    assert.equal(
      result.ledger.some((entry) => entry.kind === "EMI" && entry.amount !== 0),
      false,
      `hour ${hour}: grace ledger must not contain a debit EMI`,
    );
  }
  state = {
    ...result.state,
    cash: state.cash + result.cashDelta,
    systemTimeMs: state.systemTimeMs + HOUR,
  };
}

const firstEligible = hourlyResults[3];
assert.equal(firstEligible.breakdown.emi, loan.monthlyPayment);
assert.equal(
  firstEligible.ledger.filter((entry) => entry.kind === "EMI" && entry.amount < 0).length,
  1,
);
assert.equal(firstEligible.state.bank.loans[0].balance, 4_883.93);
assert.equal(firstEligible.state.bank.loans[0].nextDueAt, start + 3 * HOUR + HOURS_PER_MONTH * HOUR);
assert.equal(
  Number((base.cash + hourlyResults.reduce((sum, result) => sum + result.cashDelta, 0)).toFixed(2)),
  state.cash,
);

// Persist immediately after the first eligible payment, then continue for another month.
state = JSON.parse(JSON.stringify(state));
let paymentEvents = 1;
for (let hour = 5; hour <= HOURS_PER_MONTH + 4; hour += 1) {
  const result = settleHour(state);
  assert.equal(
    cashLedgerDelta(result),
    result.cashDelta,
    `hour ${hour}: reloaded cash delta must reconcile with non-tax ledger entries`,
  );
  if (result.breakdown.emi > 0) {
    paymentEvents += 1;
    assert.equal(result.breakdown.emi, loan.monthlyPayment);
    assert.equal(
      result.ledger.filter((entry) => entry.kind === "EMI" && entry.amount < 0).length,
      1,
    );
  }
  state = {
    ...result.state,
    cash: state.cash + result.cashDelta,
    systemTimeMs: state.systemTimeMs + HOUR,
  };
}
assert.equal(paymentEvents, 2, "the next monthly payment must occur once after the due date");

// A legacy loan without nextDueAt must still honor grace and then establish a due date.
const legacyLoan: any = { ...loan };
delete legacyLoan.nextDueAt;
let legacyState: any = {
  ...makeBase(makeBank()),
  bank: { ...makeBank(), loans: [legacyLoan] },
};
for (let hour = 1; hour <= 4; hour += 1) {
  const result = settleHour(legacyState);
  if (hour <= 3) assert.equal(result.breakdown.emi, 0);
  if (hour === 4) {
    assert.equal(result.breakdown.emi, loan.monthlyPayment);
    assert.equal(Number.isFinite(result.state.bank.loans[0].nextDueAt), true);
  }
  legacyState = {
    ...result.state,
    cash: legacyState.cash + result.cashDelta,
    systemTimeMs: legacyState.systemTimeMs + HOUR,
  };
}

console.log(
  JSON.stringify(
    {
      test: "hourly-settlement-monthly-emi",
      graceSettlements: loan.graceSettlements,
      firstEligibleHour: 4,
      hourlySettlementsSimulatedAfterReload: HOURS_PER_MONTH,
      monthlyPayment: loan.monthlyPayment,
      firstEligibleBalance: firstEligible.state.bank.loans[0].balance,
      paymentEventsAcrossThirtyDays: paymentEvents,
      legacyMissingNextDueAt: "PASS",
      jsonReloadBetweenPayments: "PASS",
      result: "PASS",
    },
    null,
    2,
  ),
);
