import assert from "node:assert/strict";
import { buildCanonicalBusinessRegistry } from "../src/engine/canonicalBusinessRegistry";
import { createLoan, underwriteLoan } from "../src/engine/bankEngine";
import { settleHour } from "../src/engine/financialCore";
import { simulateBusinessOperations } from "../src/engine/businessSimulation";
import { GAME_DAYS_PER_MONTH, GAME_DAYS_PER_YEAR } from "../src/engine/gameCalendar";
import { defaultBankState } from "../src/types/bank";

const now = 1_800_000_000_000;
const retail: any = {
  id: "proof-retail",
  name: "Proof Retail Co.",
  sector: "Retail",
  isUnlocked: true,
  unlockNetWorthRequired: 0,
  isAcquired: true,
  acquisitionCost: 15_000,
  legalStatus: "Licensed_Legal",
  policeHeat: 0,
  stability: 90,
  hourlyNetProfit: 100,
  stockUnits: 0,
  unitWholesaleCost: 2,
  monthlyRent: 800,
  monthlyPayroll: 1_200,
  pricingTier: "Standard",
  salesRemainder: 0,
  pendingSettlementAmount: 0,
};

// Empty shelves cannot bank demand that instantly consumes newly purchased stock.
const idle = simulateBusinessOperations([retail], 3_600, 3_600, 100_000);
assert.equal((idle.businesses[0] as any).stockUnits, 0);
assert.equal((idle.businesses[0] as any).salesRemainder, 0);
assert.equal((idle.businesses[0] as any).pendingSettlementAmount, 0);

// Selling purchased inventory creates gross cash receipts (less sales tax and fixed costs),
// while wholesale cost was already paid when the player stocked the business.
const stocked = { ...retail, stockUnits: 100 };
const sale = simulateBusinessOperations([stocked], 3_600, 3_600, 100_000);
const soldRetail: any = sale.businesses[0];
assert.equal(soldRetail.stockUnits, 0);
assert.equal(soldRetail.salesRemainder, 0);
assert.ok(soldRetail.pendingSettlementAmount > 390);
assert.ok(soldRetail.pendingSettlementAmount < 410);
const retailSettlement = settleHour({
  cash: 500,
  bank: defaultBankState(now),
  assets: [],
  holdings: {},
  owned: [],
  lifestyleAssets: [],
  businesses: [soldRetail],
  systemTimeMs: now,
  gameDayCounter: 0,
});
assert.ok(retailSettlement.breakdown.businessRevenue > 390);
assert.equal(retailSettlement.state.businesses[0].pendingSettlementAmount, 0);
assert.ok(retailSettlement.cashDelta > 0);

// Acquisition capital stays in the company's asset base; game-year earnings lift valuation.
const company = buildCanonicalBusinessRegistry({ businesses: [retail] })[0];
assert.equal(company.investedCapital, 15_000);
assert.equal(company.assetValue, 15_000);
assert.equal(company.valuation, 15_000 + 100 * GAME_DAYS_PER_YEAR * 1.15);

// Borrowing is attributed to the company and is bounded by its valuation and 40% monthly earnings.
const bank = defaultBankState(now);
const borrower = {
  id: company.id,
  name: company.name,
  valuation: company.valuation,
  hourlyNet: 100,
  termMonths: 36,
};
const loanDecision = underwriteLoan(
  bank,
  "SBA_MICROLOAN",
  5_000,
  100_000,
  100,
  { id: company.id, name: company.name, value: company.valuation },
  borrower,
);
assert.equal(loanDecision.decision, "APPROVE");
const zeroEarningsDecision = underwriteLoan(
  bank,
  "SBA_MICROLOAN",
  5_000,
  100_000,
  100,
  { id: company.id, name: company.name, value: company.valuation },
  { ...borrower, hourlyNet: 0 },
);
assert.equal(zeroEarningsDecision.decision, "DECLINE");
const loan = createLoan(
  bank,
  "SBA_MICROLOAN",
  loanDecision.amount,
  loanDecision.apr,
  now,
  36,
  { id: company.id, name: company.name },
  { id: company.id, name: company.name, gameDayCounter: 0 },
);
assert.equal(loan.borrowerBusinessId, company.id);
assert.equal(loan.nextDueGameDay, GAME_DAYS_PER_MONTH);
assert.equal(loan.nextDueAt, now + GAME_DAYS_PER_MONTH * 3_600_000);

// If a due EMI cannot be funded, no cash or principal is fabricated; it stays past due.
const dueLoan: any = {
  ...loan,
  id: "proof-due-loan",
  principal: 1_000,
  balance: 1_000,
  apr: 0,
  monthlyPayment: 100,
  nextDueAt: now,
  nextDueGameDay: 1,
  missedPayments: 0,
  graceSettlements: 0,
  settlementsElapsed: 0,
};
const poorSettlement = settleHour({
  cash: 10,
  bank: { ...bank, loans: [dueLoan] },
  assets: [],
  holdings: {},
  owned: [],
  lifestyleAssets: [],
  businesses: [],
  systemTimeMs: now,
  gameDayCounter: 0,
});
assert.equal(poorSettlement.breakdown.emi, 0);
assert.equal(poorSettlement.state.bank.loans[0].balance, 1_000);
assert.equal(poorSettlement.state.bank.loans[0].nextDueGameDay, 1);
assert.equal(poorSettlement.state.bank.loans[0].missedPayments, 1);
assert.equal(poorSettlement.cashDelta, 0);
assert.match(
  poorSettlement.ledger.find((entry) => entry.kind === "EMI")?.detail || "",
  /postponed.*remains due/i,
);

// When cashflow later covers the payment, the scheduled EMI is debited and next month resets from today.
const fundedSettlement = settleHour({
  cash: 500,
  bank: { ...bank, loans: [poorSettlement.state.bank.loans[0]] },
  assets: [],
  holdings: {},
  owned: [],
  lifestyleAssets: [],
  businesses: [],
  systemTimeMs: now + 3_600_000,
  gameDayCounter: 1,
});
assert.equal(fundedSettlement.breakdown.emi, 100);
assert.equal(fundedSettlement.state.bank.loans[0].balance, 900);
assert.equal(fundedSettlement.state.bank.loans[0].missedPayments, 0);
assert.equal(
  fundedSettlement.state.bank.loans[0].nextDueGameDay,
  1 + GAME_DAYS_PER_MONTH + 1,
);
assert.equal(fundedSettlement.cashDelta, -100);

console.log(
  JSON.stringify(
    {
      status: "PASS",
      gameCalendar: "1 settlement hour = 1 game-day",
      monthDays: GAME_DAYS_PER_MONTH,
      yearDays: GAME_DAYS_PER_YEAR,
      retail: {
        emptyShelfBacklog: "cleared",
        stockUnitsSold: 100,
        cashReceipts: retailSettlement.breakdown.businessRevenue,
      },
      company: {
        investedCapital: company.investedCapital,
        valuation: company.valuation,
        companyLoan: loan.borrowerBusinessId,
        noEarningsLoan: zeroEarningsDecision.decision,
      },
      emi: {
        unfundedPayment: poorSettlement.breakdown.emi,
        missedPayments: poorSettlement.state.bank.loans[0].missedPayments,
        fundedPayment: fundedSettlement.breakdown.emi,
        balanceAfter: fundedSettlement.state.bank.loans[0].balance,
      },
    },
    null,
    2,
  ),
);
