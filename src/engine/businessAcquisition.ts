import type { BankLedgerEntry } from "../types/bank";
import {
  commitCashTransaction,
  type TransactionCommitResult,
} from "./transactionGateway";

export type BusinessAcquisitionInput = {
  key: string;
  businessId: string;
  businessName: string;
  amount: number;
  detail: string;
  cash: number;
  onCashChange: (updater: (current: number) => number) => void;
  onLedger?: (entry: BankLedgerEntry) => void;
  onCommit: () => void;
  now?: number;
};

/**
 * One boundary for player-initiated business acquisition cashflows.
 * Cash, ledger, and ownership commit only after the existing spend lock accepts.
 */
export function commitBusinessAcquisition({
  key,
  businessId,
  businessName,
  amount,
  detail,
  cash,
  onCashChange,
  onLedger,
  onCommit,
  now = Date.now(),
}: BusinessAcquisitionInput): TransactionCommitResult {
  return commitCashTransaction({
    key: `business-acquisition:${key}`,
    cash,
    amount,
    onCashChange,
    onLedger,
    ledgerEntry: {
      id: `ledger-business-acquisition-${businessId}`,
      kind: "PURCHASE",
      label: `Business acquisition · ${businessName}`,
      amount: -amount,
      timestamp: now,
      detail,
    },
    onCommit,
    now,
  });
}
