import type { BankingData } from "../types/business";
import {
  BANKING_STAGE_ORDER,
  BANKING_STAGE_THRESHOLDS,
  BankingCompanyStage,
  BankingCompanyState,
  BankingBranchState,
  BankingLoanBookEntry,
  BankingLoanKind,
} from "../types/bankingCompany";

export const DEFAULT_BANKING_COMPANY_STATE: BankingCompanyState = {
  companyStage: "Small bank",
  headquartersOpen: false,
  licenseApproved: false,
  initialCapital: 0,
  customerAccounts: [],
  loanBook: [],
  staff: {
    branchManagers: 0,
    tellers: 2,
    loanOfficers: 1,
    riskAnalysts: 0,
    securityStaff: 0,
    payrollPerHour: 110,
  },
  branches: [],
  atmCount: 0,
  digitalUsers: 0,
  digitalLevel: 0,
  digitalInvestment: 0,
  liquidityReserve: 0,
  reserveRatio: 0.18,
  badLoanRate: 0,
  riskLevel: 22,
  serviceQuality: 68,
  fraudAlerts: 0,
  cybersecurityLevel: 1,
  enterpriseClients: 0,
  regions: 1,
  acquisitions: 0,
  hourlyInterestIncome: 0,
  hourlyInterestExpense: 0,
  hourlyOperatingCost: 0,
  hourlyNetProfit: 0,
  totalDepositsRaised: 0,
  totalLoansIssued: 0,
  totalInterestEarned: 0,
  totalDefaults: 0,
  lastDecision: "Form the bank and secure a license.",
};

export type BankingSimulationResult = {
  business: BankingData;
  hourlyRate: number;
  pendingAmount: number;
  cashDelta: number;
  events: string[];
};

export function bankingStageFor(netWorth: number): BankingCompanyStage {
  let stage: BankingCompanyStage = "Small bank";
  for (const candidate of BANKING_STAGE_ORDER) {
    if (netWorth >= BANKING_STAGE_THRESHOLDS[candidate]) stage = candidate;
  }
  return stage;
}

export function bankingStageIndex(stage: BankingCompanyStage): number {
  return Math.max(0, BANKING_STAGE_ORDER.indexOf(stage));
}

export function canUseBankingStage(
  current: BankingCompanyStage,
  required: BankingCompanyStage,
): boolean {
  return bankingStageIndex(current) >= bankingStageIndex(required);
}

export function initializeBankingCompany(
  raw: BankingData,
  netWorth: number,
): BankingData {
  const legacy = raw as Partial<BankingCompanyState>;
  const merged: BankingData = {
    ...raw,
    ...DEFAULT_BANKING_COMPANY_STATE,
    ...legacy,
    staff: { ...DEFAULT_BANKING_COMPANY_STATE.staff, ...(legacy.staff ?? {}) },
    customerAccounts: Array.isArray(legacy.customerAccounts)
      ? legacy.customerAccounts
      : [],
    loanBook: Array.isArray(legacy.loanBook) ? legacy.loanBook : [],
    branches: Array.isArray(legacy.branches) ? legacy.branches : [],
  };
  const stage = bankingStageFor(netWorth);
  const deposits = merged.customerAccounts
    .filter((account) => account.active)
    .reduce((sum, account) => sum + Math.max(0, account.balance), 0);
  const branches = merged.branches.filter((branch) => branch.open);
  return {
    ...merged,
    companyStage: stage,
    totalDepositsRaised: Math.max(0, merged.totalDepositsRaised, deposits),
    liquidityReserve: Math.max(
      0,
      merged.liquidityReserve || deposits * merged.reserveRatio,
    ),
    staff: {
      ...merged.staff,
      payrollPerHour: Math.max(0, merged.staff.payrollPerHour),
    },
    branches,
    regions: Math.max(1, merged.regions),
    serviceQuality: Math.max(0, Math.min(100, merged.serviceQuality)),
    riskLevel: Math.max(0, Math.min(100, merged.riskLevel)),
    cybersecurityLevel: Math.max(1, Math.min(5, merged.cybersecurityLevel)),
  };
}

export function bankingCompanyAssetValue(business: BankingData): number {
  const deposits = Math.max(0, business.totalDepositsRaised);
  const loanBook = business.loanBook.reduce(
    (sum, loan) => sum + Math.max(0, loan.outstanding),
    0,
  );
  const branchValue = business.branches
    .filter((branch) => branch.open)
    .reduce((sum, branch) => sum + 180_000 + branch.customers * 85, 0);
  const digitalValue = business.digitalUsers * 42 + business.digitalLevel * 125_000;
  const enterpriseValue = business.enterpriseClients * 250_000 + business.acquisitions * 1_000_000;
  return Number(
    (
      business.acquisitionCost +
      deposits * 0.08 +
      loanBook * 0.12 +
      branchValue +
      digitalValue +
      enterpriseValue
    ).toFixed(2),
  );
}

export function bankingHourlyProfit(business: BankingData): number {
  if (!business.isAcquired || !business.licenseApproved) return 0;
  const deposits = Math.max(0, business.totalDepositsRaised);
  const performingLoans = business.loanBook
    .filter((loan) => loan.status === "Performing" || loan.status === "Watch")
    .reduce((sum, loan) => sum + Math.max(0, loan.outstanding), 0);
  const interestIncome = performingLoans * 0.065 / 8760;
  const interestExpense = deposits * 0.022 / 8760;
  const feeIncome = business.customerAccounts.filter((account) => account.active).length * 3.5 + business.digitalUsers * 0.015;
  const branchIncome = business.branches.filter((branch) => branch.open).reduce((sum, branch) => sum + branch.customers * 0.42, 0);
  const riskDrag = (business.badLoanRate * 0.4 + business.riskLevel * 0.08) * Math.max(1, performingLoans / 1_000_000);
  const revenue = (interestIncome + feeIncome + branchIncome) * (business.serviceQuality / 100);
  const costs = interestExpense + business.staff.payrollPerHour + business.hourlyOperatingCost + riskDrag;
  return Number(Math.max(0, revenue - costs).toFixed(2));
}

export function advanceBankingCompany(
  raw: BankingData,
  elapsedSeconds: number,
  netWorth: number,
): BankingSimulationResult {
  const business = initializeBankingCompany(raw, netWorth);
  const events: string[] = [];
  if (!business.isAcquired || !business.licenseApproved) {
    return { business: { ...business, hourlyNetProfit: 0 }, hourlyRate: 0, pendingAmount: 0, cashDelta: 0, events };
  }
  const deposits = business.customerAccounts.map((account) => ({
    ...account,
    balance: Number((account.balance * Math.pow(1 + account.apy / 8760, elapsedSeconds / 3600)).toFixed(2)),
  }));
  const depositTotal = deposits.reduce((sum, account) => sum + account.balance, 0);
  const branchGrowth = business.branches.map((branch) => ({
    ...branch,
    customers: branch.open ? branch.customers + Math.floor((elapsedSeconds / 3600) * (business.staff.tellers + 1) * 3) : branch.customers,
    deposits: branch.open ? branch.deposits + Math.floor((elapsedSeconds / 3600) * 180) : branch.deposits,
  }));
  const next: BankingData = {
    ...business,
    companyStage: bankingStageFor(netWorth),
    customerAccounts: deposits,
    branches: branchGrowth,
    totalDepositsRaised: Math.max(business.totalDepositsRaised, depositTotal),
    liquidityReserve: Math.max(0, depositTotal * business.reserveRatio),
    serviceQuality: Math.max(0, Math.min(100, business.serviceQuality + (business.staff.tellers > 0 ? 0.01 : -0.02) * elapsedSeconds)),
    badLoanRate: Math.max(0, Math.min(25, business.badLoanRate + (business.riskLevel > 70 ? 0.002 : -0.001) * elapsedSeconds)),
    riskLevel: Math.max(0, Math.min(100, business.riskLevel + (business.staff.riskAnalysts > 0 ? -0.01 : 0.015) * elapsedSeconds)),
  };
  const hourlyRate = bankingHourlyProfit(next);
  if (next.riskLevel > 75) events.push(`${next.name}: liquidity risk is elevated; add reserves or risk analysts.`);
  if (next.badLoanRate > 8) events.push(`${next.name}: bad-loan ratio is pressuring treasury earnings.`);
  return {
    business: {
      ...next,
      hourlyInterestIncome: Number((Math.max(0, next.totalLoansIssued) * 0.065 / 8760).toFixed(2)),
      hourlyInterestExpense: Number((next.totalDepositsRaised * 0.022 / 8760).toFixed(2)),
      hourlyNetProfit: hourlyRate,
      baseHourlyNetProfit: hourlyRate,
    },
    hourlyRate,
    pendingAmount: Number((hourlyRate * elapsedSeconds / 3600).toFixed(2)),
    cashDelta: 0,
    events,
  };
}

export function approveBankLicense(business: BankingData): BankingData {
  return { ...business, headquartersOpen: true, licenseApproved: true, lastDecision: "License approved; start building customer trust." };
}

export function createBankBranch(business: BankingData, city: string): BankingData | null {
  if (business.branches.some((branch) => branch.city === city)) return null;
  const branch: BankingBranchState = { id: `branch-${city.toLowerCase().replace(/[^a-z]+/g, "-")}`, city, customers: 40, deposits: 0, operatingCostPerHour: 85, open: true };
  return { ...business, branches: [...business.branches, branch], regions: Math.max(business.regions, business.branches.length + 1), lastDecision: `Opened a branch in ${city}.` };
}

export function hireBankingStaff(business: BankingData, role: keyof BankingCompanyState["staff"]): BankingData {
  const salary: Record<keyof BankingCompanyState["staff"], number> = { branchManagers: 95, tellers: 38, loanOfficers: 62, riskAnalysts: 78, securityStaff: 54, payrollPerHour: 0 };
  if (role === "payrollPerHour") return business;
  return { ...business, staff: { ...business.staff, [role]: business.staff[role] + 1, payrollPerHour: business.staff.payrollPerHour + salary[role] }, lastDecision: `Hired a ${role.replace(/([A-Z])/g, " $1").toLowerCase()}.` };
}

export function upgradeDigitalBanking(business: BankingData): BankingData | null {
  if (business.digitalLevel >= 4) return null;
  const level = (business.digitalLevel + 1) as BankingCompanyState["digitalLevel"];
  return { ...business, digitalLevel: level, digitalUsers: business.digitalUsers + 250 * level, digitalInvestment: business.digitalInvestment + level * 85_000, cybersecurityLevel: Math.min(5, business.cybersecurityLevel + 1), lastDecision: `Digital banking upgraded to level ${level}.` };
}

export function issueBankLoan(business: BankingData, kind: BankingLoanKind, principal: number): BankingData | null {
  if (principal <= 0 || principal > business.liquidityReserve * 2) return null;
  const apr = kind === "Personal" ? 0.095 : kind === "Business" ? 0.082 : 0.068;
  const loan: BankingLoanBookEntry = { id: `loan-${business.loanBook.length + 1}`, kind, principal, outstanding: principal, apr, riskScore: business.riskLevel, termHours: 24 * 365, remainingHours: 24 * 365, status: "Performing" };
  return { ...business, loanBook: [...business.loanBook, loan], totalLoansIssued: business.totalLoansIssued + principal, liquidityReserve: Math.max(0, business.liquidityReserve - principal), lastDecision: `Issued a ${kind.toLowerCase()} loan.` };
}
