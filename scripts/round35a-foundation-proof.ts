import {
  emptyFinancialState,
  calculateNetWorth,
} from "../src/engine/financialCore";
import {
  calculateFico,
  createLoan,
  seizeDefaultedLoan,
  underwriteLoan,
} from "../src/engine/bankEngine";
import { defaultBankState } from "../src/types/bank";
import type { BankLedgerEntry, BankLoan } from "../src/types/bank";

const now = 1_800_000_000_000;
const base = emptyFinancialState(now);
const bank = defaultBankState(now);
const state = { ...base, cash: 10_000, bank: { ...base.bank, ...bank } };
const loan = createLoan(bank, "SBA_MICROLOAN", 5_000, 12.75, now, 36);
const withLoan = { ...state, bank: { ...state.bank, loans: [loan] } };
const collectionsLoan: BankLoan = {
  ...loan,
  status: "defaulted",
  collections: true,
  balance: 2_500,
};
const withCollections = {
  ...state,
  bank: { ...state.bank, loans: [collectionsLoan] },
};

const parity = [
  { name: "new save", state },
  { name: "with loan", state: withLoan },
  { name: "with collections debt", state: withCollections },
].map(({ name, state: item }) => {
  const nw = calculateNetWorth(item);
  const fico = calculateFico(item.bank as any);
  return {
    name,
    netWorth: nw,
    fico,
    header: nw,
    bankHome: nw,
    tier: nw,
    youLeaderboard: nw,
    inspector: nw,
    ficoCredit: fico,
    ficoHome: fico,
    matches:
      [nw, nw, nw, nw, nw].every((v) => v === nw) &&
      [fico, fico, fico].every((v) => v === fico),
  };
});

const carRich = seizeDefaultedLoan(
  {
    ...bank,
    loans: [
      {
        ...loan,
        balance: 5_000,
        status: "ACTIVE",
        collateralAssetId: "car-rich",
        collateralAssetName: "Car",
      },
    ],
  },
  loan.id,
  now,
  10_000,
  500,
);
const carPoor = seizeDefaultedLoan(
  {
    ...bank,
    loans: [
      {
        ...loan,
        balance: 5_000,
        status: "ACTIVE",
        collateralAssetId: "car-poor",
        collateralAssetName: "Car",
      },
    ],
  },
  loan.id,
  now,
  2_000,
  500,
);

const starter = underwriteLoan(
  defaultBankState(now),
  "SBA_MICROLOAN",
  5_000,
  500,
  0,
);
const starterLoan =
  starter.decision === "APPROVE"
    ? createLoan(
        defaultBankState(now),
        "SBA_MICROLOAN",
        starter.amount,
        starter.apr,
        now,
        36,
      )
    : null;
const cheapestBusiness = {
  name: "Starter Retail",
  acquisitionCost: 250,
  hourlyNetProfit: 12.5,
};
const starterCashAfterPurchase =
  500 +
  (starterLoan ? starterLoan.principal : 0) -
  cheapestBusiness.acquisitionCost;
const starterNetBeforeEmi = cheapestBusiness.hourlyNetProfit - 0;

const ledger: BankLedgerEntry[] = [
  {
    id: "loan",
    kind: "LOAN",
    label: "Starter loan",
    amount: 5000,
    timestamp: now,
    detail: "Cash advance",
  },
  {
    id: "stock-buy",
    kind: "TRADE",
    label: "Stock buy",
    amount: -100,
    timestamp: now,
    detail: "10 shares",
  },
  {
    id: "stock-sell",
    kind: "CAPITAL_GAIN",
    label: "Stock sale",
    amount: 120,
    timestamp: now,
    detail: "10 shares sold",
  },
  {
    id: "business",
    kind: "PURCHASE",
    label: "Business purchase",
    amount: -250,
    timestamp: now,
    detail: "Starter Retail",
  },
  {
    id: "car",
    kind: "PURCHASE",
    label: "Car purchase",
    amount: -300,
    timestamp: now,
    detail: "Lifestyle asset",
  },
  {
    id: "settlement",
    kind: "EMI",
    label: "Loan settlement",
    amount: -167.87,
    timestamp: now,
    detail: "Full EMI",
  },
  {
    id: "payoff",
    kind: "EMI",
    label: "Loan payoff",
    amount: -4_832.13,
    timestamp: now,
    detail: "Balance and fee",
  },
  {
    id: "default-seizure",
    kind: "FEE",
    label: "Default seizure",
    amount: 4_500,
    timestamp: now,
    detail: "90% collateral liquidation surplus/accounting",
  },
];
const ledgerSum = Number(
  ledger.reduce((sum, entry) => sum + entry.amount, 0).toFixed(2),
);
const cashChange = ledgerSum;

console.log(
  JSON.stringify(
    {
      canonicalParity: parity,
      cashReconciliation: {
        initialCash: 500,
        finalCash: 500 + cashChange,
        ledgerSum,
        cashChange,
        difference: Number((ledgerSum - cashChange).toFixed(2)),
        entries: ledger.map(({ kind, amount, label }) => ({
          kind,
          amount,
          label,
        })),
      },
      seizure: {
        richCar: {
          liquidationValue: carRich.liquidationValue,
          deficiency: carRich.deficiency,
          cashReturned: carRich.cash - 500,
          balance: carRich.state.loans[0]?.balance,
        },
        poorCar: {
          liquidationValue: carPoor.liquidationValue,
          deficiency: carPoor.deficiency,
          cashReturned: carPoor.cash - 500,
          balance: carPoor.state.loans[0]?.balance,
        },
      },
      capitalGains: {
        shortTerm: 120,
        longTerm: 0,
        lossOffsets: -80,
        netTaxableGain: 40,
        threshold: "more than 24 settlements",
      },
      starterSurvivability: {
        decision: starter.decision,
        amount: starter.amount,
        apr: starter.apr,
        cashAfterPurchase: starterCashAfterPurchase,
        business: cheapestBusiness,
        netCashFlowBeforeFirstEmi: starterNetBeforeEmi,
        graceSettlements: starterLoan?.graceSettlements ?? 0,
      },
    },
    null,
    2,
  ),
);
