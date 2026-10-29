import assert from "node:assert/strict";
import { createLoan, underwriteLoan } from "../src/engine/bankEngine";
import { settleHour } from "../src/engine/financialCore";

const start = 1_800_000_000_000;
const bank: any = {
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
};
const base: any = {
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
};

const decision = underwriteLoan(bank, "SBA_MICROLOAN", 5_000, 2_000, 0);
assert.equal(decision.decision, "APPROVE");
const loan = createLoan(bank, "SBA_MICROLOAN", 5_000, decision.apr, start);
let state: any = { ...base, bank: { ...bank, loans: [loan] } };
const payments: Array<{ hour: number; emi: number; balance: number }> = [];

for (let hour = 1; hour <= 24 * 30; hour += 1) {
  const result = settleHour(state);
  if (result.breakdown.emi > 0)
    payments.push({
      hour,
      emi: result.breakdown.emi,
      balance: result.state.bank.loans[0].balance,
    });
  state = {
    ...result.state,
    cash: state.cash + result.cashDelta,
    systemTimeMs: state.systemTimeMs + 3600000,
  };
}

assert.equal(
  payments.length,
  1,
  `expected one monthly payment in 30 days, got ${payments.length}`,
);
assert.equal(payments[0].emi, loan.monthlyPayment);

console.log(
  JSON.stringify(
    {
      test: "hourly-settlement-monthly-emi",
      graceSettlements: loan.graceSettlements,
      hourlySettlementsSimulated: 24 * 30,
      monthlyPayment: loan.monthlyPayment,
      paymentEvents: payments,
      result: "PASS",
    },
    null,
    2,
  ),
);
