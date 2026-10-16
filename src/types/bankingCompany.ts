export type BankingCompanyStage =
  | "Small bank"
  | "Growing bank"
  | "Large bank"
  | "Banking group";

export type BankCustomerAccountKind = "Savings" | "Current";
export type BankingLoanKind = "Personal" | "Business" | "Institutional";

export interface BankCustomerAccount {
  id: string;
  kind: BankCustomerAccountKind;
  balance: number;
  apy: number;
  active: boolean;
}

export interface BankingLoanBookEntry {
  id: string;
  kind: BankingLoanKind;
  principal: number;
  outstanding: number;
  apr: number;
  riskScore: number;
  termHours: number;
  remainingHours: number;
  status: "Performing" | "Watch" | "Defaulted" | "Recovered";
}

export interface BankingStaffState {
  branchManagers: number;
  tellers: number;
  loanOfficers: number;
  riskAnalysts: number;
  securityStaff: number;
  payrollPerHour: number;
}

export interface BankingBranchState {
  id: string;
  city: string;
  customers: number;
  deposits: number;
  operatingCostPerHour: number;
  open: boolean;
}

export interface BankingCompanyState {
  companyStage: BankingCompanyStage;
  headquartersOpen: boolean;
  licenseApproved: boolean;
  initialCapital: number;
  customerAccounts: BankCustomerAccount[];
  loanBook: BankingLoanBookEntry[];
  staff: BankingStaffState;
  branches: BankingBranchState[];
  atmCount: number;
  digitalUsers: number;
  digitalLevel: 0 | 1 | 2 | 3 | 4;
  digitalInvestment: number;
  liquidityReserve: number;
  reserveRatio: number;
  badLoanRate: number;
  riskLevel: number;
  serviceQuality: number;
  fraudAlerts: number;
  cybersecurityLevel: number;
  enterpriseClients: number;
  regions: number;
  acquisitions: number;
  hourlyInterestIncome: number;
  hourlyInterestExpense: number;
  hourlyOperatingCost: number;
  hourlyNetProfit: number;
  totalDepositsRaised: number;
  totalLoansIssued: number;
  totalInterestEarned: number;
  totalDefaults: number;
  lastDecision?: string;
}

export const BANKING_STAGE_ORDER: BankingCompanyStage[] = [
  "Small bank",
  "Growing bank",
  "Large bank",
  "Banking group",
];

export const BANKING_STAGE_THRESHOLDS: Record<BankingCompanyStage, number> = {
  "Small bank": 1_500_000,
  "Growing bank": 5_000_000,
  "Large bank": 25_000_000,
  "Banking group": 100_000_000,
};
