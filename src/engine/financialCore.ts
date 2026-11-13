import type { BusinessEntity } from "../types/business";
import type { CollectionItem } from "../data/collectionTypes";
import type { Asset, Holding } from "../types/marketAsset";
import type {
  BankDeposit,
  BankInvestor,
  BankLoan,
  BankMarketEvent,
  BankState,
  InsurancePolicy,
  BankLedgerEntry,
  TaxRecord,
} from "../types/bank";
import {
  calculateTax,
  depositSpec,
  isActiveLoan,
  isDebtBearingLoan,
} from "./bankEngine";
import { constructionAssetValue } from "./constructionCompanyEngine";
import type { TaxiCompanyState } from "../types/taxi";
import { taxiHourlyEconomics } from "../types/taxi";
import { itCompanyAssetValue } from "./itCompanyEngine";
import { bankingCompanyAssetValue } from "./bankingCompanyEngine";
import {
  GAME_DAYS_PER_MONTH,
  GAME_DAYS_PER_YEAR,
  REAL_MS_PER_SETTLEMENT,
  safeGameDayCounter,
} from "./gameCalendar";
import {
  canonicalAssetValue,
  canonicalSettlementRevenue,
  buildCanonicalBusinessRegistry,
  advanceSpecializedBusinessSources,
  type CanonicalBusiness,
  type SpecializedBusinessSources,
} from "./canonicalBusinessRegistry";

export type FinancialGameState = {
  cash: number;
  bank: Pick<
    BankState,
    | "savingsBalance"
    | "businessCheckingBalance"
    | "deposits"
    | "loans"
    | "insurance"
    | "investors"
    | "savingsRateBoostUntil"
    | "taxRecords"
    | "marketEvents"
  >;
  assets: Asset[];
  holdings: Record<string, Holding>;
  owned: string[];
  lifestyleAssets: CollectionItem[];
  businesses: BusinessEntity[];
  taxiCompany?: TaxiCompanyState | null;
  businessRegistry?: CanonicalBusiness[];
  businessSources?: SpecializedBusinessSources;
  /** Number of completed hourly settlements / game-days; omitted by legacy callers. */
  gameDayCounter?: number;
  systemTimeMs: number;
  multiplier?: number;
};

export type SettlementResult = {
  state: FinancialGameState;
  cashDelta: number;
  projectedHourlyNet: number;
  ledger: BankLedgerEntry[];
  breakdown: {
    businessRevenue: number;
    interest: number;
    loanInterest?: number;
    emi: number;
    premiums: number;
    upkeep: number;
    investorShare: number;
    taxAccrual: number;
  };
};

const n = (value: unknown) =>
  Number.isFinite(Number(value)) ? Number(value) : 0;
const positive = (value: unknown) => Math.max(0, n(value));
const round = (value: number) => Number(value.toFixed(2));

export function calculateNetWorth(state: FinancialGameState): number {
  const portfolio = Object.entries(state.holdings || {}).reduce(
    (sum, [id, holding]) =>
      sum +
      positive(holding?.shares) *
        positive(state.assets.find((item) => item.id === id)?.price),
    0,
  );
  const lifestyle = (state.owned || []).reduce(
    (sum, id) =>
      sum +
      positive(state.lifestyleAssets.find((item) => item.id === id)?.price),
    0,
  );
  const businessAssets = canonicalAssetValue(getBusinessRegistry(state));
  const deposits = (state.bank.deposits || []).reduce(
    (sum, deposit) =>
      sum + (deposit.status === "ACTIVE" ? positive(deposit.principal) : 0),
    0,
  );
  const debt = (state.bank.loans || []).reduce(
    (sum, loan) => sum + (isDebtBearingLoan(loan) ? positive(loan.balance) : 0),
    0,
  );
  return Math.max(
    0,
    positive(state.cash) +
      positive(state.bank.savingsBalance) +
      positive(state.bank.businessCheckingBalance) +
      deposits +
      portfolio +
      lifestyle +
      businessAssets -
      debt,
  );
}

function getBusinessRegistry(state: FinancialGameState): CanonicalBusiness[] {
  return state.businessRegistry?.length
    ? state.businessRegistry
    : buildCanonicalBusinessRegistry({
        businesses: state.businesses || [],
        ...(state.businessSources || {}),
        taxiCompany: state.taxiCompany,
      });
}

function entry(
  id: string,
  kind: BankLedgerEntry["kind"],
  label: string,
  amount: number,
  timestamp: number,
  detail: string,
): BankLedgerEntry {
  return { id, kind, label, amount: round(amount), timestamp, detail };
}
function businessRevenue(state: FinancialGameState) {
  return canonicalSettlementRevenue(getBusinessRegistry(state)) * (state.multiplier ?? 1);
}

function savingsInterest(state: FinancialGameState) {
  const event = state.bank.marketEvents?.[state.bank.marketEvents.length - 1];
  const eventBump =
    event?.kind === "RECESSION" || event?.kind === "RATE_HIKE"
      ? event.cdRateBump / 100
      : 0;
  const savingsRate =
    (state.bank.savingsRateBoostUntil > state.systemTimeMs ? 0.0525 : 0.0425) +
    eventBump;
  const savings =
    (positive(state.bank.savingsBalance) * savingsRate) / GAME_DAYS_PER_YEAR;
  const deposits = (state.bank.deposits || [])
    .filter((item) => item.status === "ACTIVE")
    .reduce(
      (sum, item) =>
        sum +
        (positive(item.principal) * (positive(item.rate) / 100)) /
          GAME_DAYS_PER_YEAR,
      0,
    );
  return savings + deposits;
}
function upkeep(state: FinancialGameState) {
  return (state.owned || []).reduce(
    (sum, id) =>
      sum +
      positive(state.lifestyleAssets.find((item) => item.id === id)?.upkeep) /
        GAME_DAYS_PER_MONTH,
    0,
  );
}
function investorShare(state: FinancialGameState, revenue: number) {
  return (state.bank.investors || []).reduce(
    (sum, investor) => sum + (revenue * positive(investor.equityPercent)) / 100,
    0,
  );
}
const GAME_MONTH_MS = GAME_DAYS_PER_MONTH * REAL_MS_PER_SETTLEMENT;

function loanPaymentFor(
  loan: BankLoan,
  timestamp: number,
  settlementGameDay?: number,
) {
  if (!isActiveLoan(loan)) return { emi: 0, interest: 0, principal: 0 };
  const elapsed = Number(loan.settlementsElapsed || 0);
  const grace = Math.max(0, Number(loan.graceSettlements || 0));
  const dueAt = Number.isFinite(loan.nextDueAt) ? loan.nextDueAt : timestamp;
  const gameDayDue =
    settlementGameDay !== undefined && Number.isFinite(loan.nextDueGameDay)
      ? settlementGameDay >= Number(loan.nextDueGameDay)
      : timestamp >= dueAt;
  if (!gameDayDue || elapsed < grace)
    return { emi: 0, interest: 0, principal: 0 };
  const interest = (positive(loan.balance) * positive(loan.apr)) / 100 / 12;
  const payment = Math.min(
    positive(loan.monthlyPayment),
    positive(loan.balance) + interest,
  );
  return {
    emi: payment,
    interest: Math.min(payment, interest),
    principal: Math.max(0, payment - interest),
  };
}

function loanParts(
  state: FinancialGameState,
  timestamp: number,
  settlementGameDay?: number,
) {
  return (state.bank.loans || []).reduce(
    (result, loan) => {
      const parts = loanPaymentFor(loan, timestamp, settlementGameDay);
      result.emi += parts.emi;
      result.interest += parts.interest;
      result.principal += parts.principal;
      return result;
    },
    { emi: 0, interest: 0, principal: 0 },
  );
}

/** Steady-state hourly net: ignores amounts already accrued for the next settlement. */
export function projectHourlyNet(state: FinancialGameState): number {
  const registry = getBusinessRegistry(state).map((b) => ({ ...b, pendingSettlementAmount: 0 }));
  return settleHour({ ...state, businessRegistry: registry }).projectedHourlyNet;
}

export function settleHour(state: FinancialGameState): SettlementResult {
  const timestamp = state.systemTimeMs;
  const settlementGameDay =
    state.gameDayCounter === undefined
      ? undefined
      : safeGameDayCounter(state.gameDayCounter) + 1;
  const revenue = businessRevenue(state);
  const interest = savingsInterest(state);
  const scheduledLoan = loanParts(state, timestamp, settlementGameDay);
  const premium = (state.bank.insurance || [])
    .filter((item) => item.active)
    .reduce((sum, item) => sum + positive(item.premium) / GAME_DAYS_PER_MONTH, 0);
  const assetUpkeep = upkeep(state);
  const share = investorShare(state, revenue);
  const taxableIncome = Math.max(
    0,
    revenue + interest - scheduledLoan.interest - assetUpkeep - premium,
  );
  const priorGains = (state.bank.taxRecords || [])
    .filter((item) => item.status !== "PAID")
    .reduce((sum, item) => sum + positive(item.capitalGains), 0);
  const tax = calculateTax(
    taxableIncome * GAME_DAYS_PER_YEAR,
    scheduledLoan.interest * GAME_DAYS_PER_YEAR +
      assetUpkeep * GAME_DAYS_PER_YEAR +
      premium * GAME_DAYS_PER_YEAR,
    priorGains,
    getBusinessRegistry(state)
      .filter((item) => item.owned && item.operating)
      .reduce((sum, item) => sum + item.hourlyNet * 0.2, 0),
  );
  const taxAccrual =
    tax.federal / GAME_DAYS_PER_YEAR +
    tax.state / GAME_DAYS_PER_YEAR +
    tax.payroll / GAME_DAYS_PER_YEAR +
    tax.capitalGains / GAME_DAYS_PER_YEAR;
  const matured: BankDeposit[] = (state.bank.deposits || []).map((deposit) =>
    deposit.status === "ACTIVE" && deposit.maturesAt <= timestamp
      ? { ...deposit, status: "MATURED" as const }
      : deposit,
  );
  const maturityPayout = matured
    .filter(
      (deposit, index) =>
        deposit.status === "MATURED" &&
        state.bank.deposits[index]?.status === "ACTIVE",
    )
    .reduce(
      (sum, deposit) =>
        sum +
        deposit.principal +
        (((deposit.principal * deposit.rate) / 100) * deposit.termDays) /
          GAME_DAYS_PER_YEAR,
      0,
    );
  const marketEvent =
    state.bank.marketEvents?.[state.bank.marketEvents.length - 1];
  const insurancePayout =
    marketEvent?.kind === "RECESSION"
      ? (state.bank.insurance || [])
          .filter((item) => item.active)
          .reduce(
            (sum, policy) =>
              sum + Math.max(0, policy.coverage - policy.deductible) * 0.1,
            0,
          )
      : 0;
  const cashAvailableForEmi =
    positive(state.cash) +
    revenue +
    interest +
    maturityPayout +
    insurancePayout -
    premium -
    assetUpkeep -
    share;
  const canFundScheduledEmi =
    scheduledLoan.emi <= 0 || cashAvailableForEmi >= scheduledLoan.emi;
  const loan = canFundScheduledEmi
    ? scheduledLoan
    : { emi: 0, interest: 0, principal: 0 };
  const loanUpdates = (state.bank.loans || []).map((item) => {
    if (!isActiveLoan(item)) return item;
    const scheduledParts = loanPaymentFor(item, timestamp, settlementGameDay);
    const parts = canFundScheduledEmi
      ? scheduledParts
      : { emi: 0, interest: 0, principal: 0 };
    const nextBalance = Math.max(0, item.balance - parts.principal);
    const nextElapsed = Number(item.settlementsElapsed || 0) + 1;
    const priorDueGameDay = Number(item.nextDueGameDay);
    return {
      ...item,
      balance: round(nextBalance),
      settlementsElapsed: nextElapsed,
      status: nextBalance <= 0.01 ? ("paid_off" as const) : item.status,
      nextDueAt:
        parts.emi > 0 ? timestamp + GAME_MONTH_MS : item.nextDueAt,
      nextDueGameDay:
        parts.emi > 0 && settlementGameDay !== undefined
          ? Math.max(
              settlementGameDay,
              Number.isFinite(priorDueGameDay) ? priorDueGameDay : 0,
          ) + GAME_DAYS_PER_MONTH
          : item.nextDueGameDay,
      missedPayments:
        scheduledParts.emi > 0 && !canFundScheduledEmi
          ? Math.max(0, Number(item.missedPayments) || 0) + 1
          : parts.emi > 0
            ? 0
            : item.missedPayments,
    };
  });
  const taxRecords: TaxRecord[] = [
    ...(state.bank.taxRecords || []).filter(
      (item) => item.status !== "ESTIMATE",
    ),
    { ...tax, id: `tax-${timestamp}`, dueAt: timestamp + 90 * 24 * 3600000 },
  ];
  const items: BankLedgerEntry[] = [
    entry(
      `settle-business-${timestamp}`,
      "BUSINESS_REVENUE",
      "Business revenue",
      revenue,
      timestamp,
      state.taxiCompany?.status === "operating"
        ? "Unified hourly settlement · includes Taxi Company net operations"
        : "Unified hourly settlement",
    ),
    entry(
      `settle-interest-${timestamp}`,
      "INTEREST",
      "Savings and deposit interest",
      interest,
      timestamp,
      "Actual balances and APY",
    ),
    entry(
      `settle-emi-${timestamp}`,
      "EMI",
      "Loan EMI",
      -loan.emi,
      timestamp,
      canFundScheduledEmi || scheduledLoan.emi <= 0
        ? `Interest ${round(loan.interest)} · principal ${round(loan.principal)}`
        : `Payment postponed · cash shortfall ${round(Math.max(0, scheduledLoan.emi - Math.max(0, cashAvailableForEmi)))} · remains due`,
    ),
    entry(
      `settle-premium-${timestamp}`,
      "PREMIUM",
      "Insurance premiums",
      -premium,
      timestamp,
      "Active policies",
    ),
    entry(
      `settle-upkeep-${timestamp}`,
      "UPKEEP",
      "Lifestyle upkeep",
      -assetUpkeep,
      timestamp,
      "Owned lifestyle assets",
    ),
    entry(
      `settle-investor-${timestamp}`,
      "INVESTOR",
      "Investor profit share",
      -share,
      timestamp,
      "Ownership-based deduction",
    ),
    entry(
      `settle-tax-${timestamp}`,
      "TAX",
      "Tax accrual",
      -taxAccrual,
      timestamp,
      "Accrued liability; not paid until Tax Day",
    ),
  ];
  if (maturityPayout > 0)
    items.push(
      entry(
        `deposit-maturity-${timestamp}`,
        "INTEREST",
        "Deposit maturity payout",
        maturityPayout,
        timestamp,
        "Principal plus earned term interest",
      ),
    );
  if (insurancePayout > 0)
    items.push(
      entry(
        `insurance-payout-${timestamp}`,
        "INSURANCE",
        "Recession insurance payout",
        insurancePayout,
        timestamp,
        "Covered negative event payout after deductible",
      ),
    );
  const cashDelta =
    revenue +
    interest +
    maturityPayout +
    insurancePayout -
    loan.emi -
    premium -
    assetUpkeep -
    share;
  const projectedHourlyNet = cashDelta;
  const nextBusinesses = (state.businesses || []).map((business) =>
    business.pendingSettlementAmount
      ? { ...business, pendingSettlementAmount: 0 }
      : business,
  );
  const nextBusinessSources = state.businessSources
    ? advanceSpecializedBusinessSources(state.businessSources)
    : undefined;
  const nextRegistry = nextBusinessSources
    ? buildCanonicalBusinessRegistry({
        businesses: nextBusinesses,
        ...nextBusinessSources,
      })
    : getBusinessRegistry(state).map((business) =>
        business.pendingSettlementAmount
          ? { ...business, pendingSettlementAmount: 0 }
          : business,
      );
  return {
    state: {
      ...state,
      ...(settlementGameDay !== undefined
        ? { gameDayCounter: settlementGameDay }
        : {}),
      businessRegistry: nextRegistry,
      businesses: nextBusinesses,
      businessSources: nextBusinessSources,
      bank: {
        ...state.bank,
        loans: loanUpdates,
        deposits: matured,
        taxRecords,
      },
    },
    cashDelta: round(cashDelta),
    projectedHourlyNet: round(projectedHourlyNet),
    ledger: items,
    breakdown: {
      businessRevenue: revenue,
      interest,
      loanInterest: loan.interest,
      emi: loan.emi,
      premiums: premium,
      upkeep: assetUpkeep,
      investorShare: share,
      taxAccrual,
    },
  };
}

export const emptyFinancialState = (now = Date.now()): FinancialGameState => ({
  cash: 0,
  bank: {
    savingsBalance: 0,
    businessCheckingBalance: 0,
    deposits: [],
    loans: [],
    insurance: [],
    investors: [],
    savingsRateBoostUntil: 0,
    taxRecords: [],
    marketEvents: [],
  },
  assets: [],
  holdings: {},
  owned: [],
  lifestyleAssets: [],
  businesses: [],
  systemTimeMs: now,
});
