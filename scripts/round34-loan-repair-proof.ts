import { defaultBankState } from "../src/types/bank";
import {
  bankApr,
  canOriginateLoan,
  canSellCollateral,
  payOffLoan,
  sanitizeBankState,
  createLoan,
  isDebtBearingLoan,
  monthlyPayment,
  seizeDefaultedLoan,
  totalDebt,
  underwriteLoan,
} from "../src/engine/bankEngine";
import {
  settleHour,
  calculateNetWorth,
  type FinancialGameState,
} from "../src/engine/financialCore";
const now = 1800000000000;
const asset = { id: "car-1", name: "Founder Car", value: 10000 };
const bank = defaultBankState();
const apr = bankApr(700, "SBA_MICROLOAN");
const loan = createLoan(bank, "SBA_MICROLOAN", 5000, apr, now, 36, {
  id: asset.id,
  name: asset.name,
});
const base: FinancialGameState = {
  cash: 10000,
  bank: { ...bank, loans: [loan] },
  assets: [],
  holdings: {},
  owned: [asset.id],
  lifestyleAssets: [
    {
      id: asset.id,
      name: asset.name,
      price: asset.value,
      upkeep: 0,
      category: "CARS",
    },
  ] as any,
  businesses: [
    {
      id: "biz",
      name: "Shop",
      isAcquired: true,
      hourlyNetProfit: 300,
      acquisitionCost: 0,
    } as any,
  ],
  systemTimeMs: now,
};
const graceTick = settleHour(base);
const dueTick = settleHour({
  ...base,
  systemTimeMs: now + 3600000,
  bank: { ...base.bank, loans: [{ ...loan, settlementsElapsed: 3 }] },
});
const defaulted = seizeDefaultedLoan(
  { ...bank, loans: [{ ...loan, delinquencyDays: 90 }], ficoScore: 700 },
  loan.id,
  now + 1,
);
const payoff = payOffLoan(base.bank, loan.id, 10000, now + 2);
const migrated = sanitizeBankState(
  {
    ...bank,
    loans: [{ ...loan, status: "DEFAULTED", principal: 49990.28, balance: 0 }],
  },
  now,
);
const ltv = underwriteLoan(bank, "SBA_MICROLOAN", 8000, 20000, 300, asset);
const unsecured = underwriteLoan(bank, "CREDIT_CARD", 25000, 20000, 10);
console.log(
  JSON.stringify(
    {
      loan: {
        apr,
        monthlyPayment: loan.monthlyPayment,
        graceSettlements: loan.graceSettlements,
        nextDueAt: loan.nextDueAt,
      },
      before: {
        cash: base.cash,
        debt: totalDebt(base.bank),
        netWorth: calculateNetWorth(base),
      },
      afterGraceSettlement: {
        cashDelta: graceTick.cashDelta,
        projectedHourlyNet: graceTick.projectedHourlyNet,
        emi: graceTick.breakdown.emi,
      },
      afterDueSettlement: {
        cashDelta: dueTick.cashDelta,
        projectedHourlyNet: dueTick.projectedHourlyNet,
        emi: dueTick.breakdown.emi,
        interest: dueTick.breakdown.loanInterest,
        principal:
          dueTick.breakdown.emi - (dueTick.breakdown.loanInterest || 0),
      },
      default: {
        status: defaulted.state.loans[0].status,
        balance: defaulted.state.loans[0].balance,
        debt: totalDebt(defaulted.state),
        fico: defaulted.state.ficoScore,
        assetSeized: defaulted.collateralAssetId,
        noNewLoansUntilSettlement: defaulted.state.noNewLoansUntilSettlement,
      },
      sale: canSellCollateral(base.bank, asset.id),
      onePerSettlement: canOriginateLoan(
        { ...bank, lastLoanOriginationSettlement: Math.floor(now / 3600000) },
        Math.floor(now / 3600000),
      ),
      payoff: {
        ok: payoff.ok,
        cash: payoff.cash,
        debt: totalDebt(payoff.state),
      },
      migratedLegacyDebt: {
        status: migrated.loans[0]?.status,
        balance: migrated.loans[0]?.balance,
        debt: totalDebt(migrated),
      },
      ltv,
      unsecured,
    },
    null,
    2,
  ),
);
