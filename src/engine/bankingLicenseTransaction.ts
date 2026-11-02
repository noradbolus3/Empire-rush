import { approveBankLicense } from "./bankingCompanyEngine";
import type { BankingData } from "../types/business";
import type { BankLedgerEntry } from "../types/bank";

export const BANKING_LICENSE_COST = 250_000;

type BankingLicenseInput = {
  business: BankingData;
  cash: number;
  timestamp: number;
};

export type BankingLicenseResult =
  | { accepted: false; reason: "already-approved" | "insufficient-funds" }
  | {
      accepted: true;
      cash: number;
      business: BankingData;
      ledgerEntry: BankLedgerEntry;
    };

/**
 * Pure transaction decision used by the active Banking setup screen.
 * The caller owns the existing UI spend lock and commits the returned slices.
 */
export function completeBankingLicense({
  business,
  cash,
  timestamp,
}: BankingLicenseInput): BankingLicenseResult {
  if (business.licenseApproved) return { accepted: false, reason: "already-approved" };
  if (!Number.isFinite(cash) || cash < BANKING_LICENSE_COST) {
    return { accepted: false, reason: "insufficient-funds" };
  }

  return {
    accepted: true,
    cash: Math.max(0, cash - BANKING_LICENSE_COST),
    business: approveBankLicense(business),
    ledgerEntry: {
      id: `ledger-banking-license-${business.id}-${timestamp}`,
      kind: "PURCHASE",
      label: `Banking license · ${business.name}`,
      amount: -BANKING_LICENSE_COST,
      timestamp,
      detail: "Bank charter license and headquarters approval",
    },
  };
}
