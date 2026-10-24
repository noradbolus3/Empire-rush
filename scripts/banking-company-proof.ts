import { advanceBankingCompany, bankingCompanyAssetValue, bankingHourlyProfit, createBankBranch, DEFAULT_BANKING_COMPANY_STATE, hireBankingStaff, initializeBankingCompany, issueBankLoan, approveBankLicense, upgradeDigitalBanking } from "../src/engine/bankingCompanyEngine";
import type { BankingData } from "../src/types/business";

const base: BankingData = {
  id: "proof-bank",
  name: "BlueHarbor Banking Company",
  sector: "Banking",
  isUnlocked: true,
  unlockNetWorthRequired: 0,
  isAcquired: true,
  acquisitionCost: 1_000_000,
  legalStatus: "Licensed_Legal",
  policeHeat: 0,
  stability: 88,
  ...DEFAULT_BANKING_COMPANY_STATE,
  hourlyNetProfit: 0,
};

let bank = initializeBankingCompany(base, 125_000_000);
const checks: Array<{ name: string; pass: boolean; detail: string }> = [];
const check = (name: string, pass: boolean, detail: string) => checks.push({ name, pass, detail });

bank = approveBankLicense(bank);
check("license approval", bank.licenseApproved && bank.headquartersOpen, bank.lastDecision ?? "");
bank = { ...bank, customerAccounts: [{ id: "savings-1", kind: "Savings", balance: 2_000_000, apy: 0.032, active: true }], totalDepositsRaised: 2_000_000, liquidityReserve: 500_000 };
check("deposit book", bank.totalDepositsRaised === 2_000_000 && bank.liquidityReserve === 500_000, `$${bank.totalDepositsRaised} deposits`);
const loaned = issueBankLoan(bank, "Business", 100_000);
check("business loan", Boolean(loaned) && (loaned?.loanBook.length ?? 0) === 1, `${loaned?.loanBook.length ?? 0} loan`);
if (loaned) bank = loaned;
bank = hireBankingStaff(bank, "riskAnalysts");
bank = createBankBranch(bank, "Austin") ?? bank;
bank = upgradeDigitalBanking(bank) ?? bank;
check("branch and digital", bank.branches.length === 1 && bank.digitalLevel === 1 && bank.staff.riskAnalysts === 1, `${bank.branches.length} branch / digital ${bank.digitalLevel}`);
const before = bankingHourlyProfit(bank);
const advanced = advanceBankingCompany(bank, 3600, 125_000_000);
check("one-hour settlement", advanced.business.hourlyNetProfit >= 0 && advanced.pendingAmount >= 0, `$${advanced.pendingAmount} pending / $${advanced.hourlyRate} hourly`);
check("asset valuation", bankingCompanyAssetValue(advanced.business) > bank.acquisitionCost, `$${bankingCompanyAssetValue(advanced.business)} assets`);
console.log(JSON.stringify({ passed: checks.filter((item) => item.pass).length, failed: checks.filter((item) => !item.pass).length, beforeHourly: before, checks, final: { stage: advanced.business.companyStage, hourlyProfit: advanced.business.hourlyNetProfit, deposits: advanced.business.totalDepositsRaised, loans: advanced.business.totalLoansIssued, branches: advanced.business.branches.length, digitalLevel: advanced.business.digitalLevel, assets: bankingCompanyAssetValue(advanced.business) } }, null, 2));
if (checks.some((item) => !item.pass)) process.exit(1);
