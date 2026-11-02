import type { BankLedgerEntry } from "../types/bank";
import {
  canSpend,
  cashAfterSpend,
  clearSpendLock,
  tryAcquireSpendLock,
} from "./walletGuard";

export type TransactionCommitInput = {
  /** Stable action identity. Rapid duplicate submissions must share this key. */
  key: string;
  cash: number;
  amount: number;
  onCashChange: (updater: (current: number) => number) => void;
  onLedger?: (entry: BankLedgerEntry) => void;
  ledgerEntry?: BankLedgerEntry;
  onCommit: () => void;
  lockDurationMs?: number;
  now?: number;
};

export type TransactionCommitResult =
  | { accepted: true; cashAfter: number; ledgerEntry?: BankLedgerEntry }
  | { accepted: false; reason: "duplicate" | "invalid-amount" | "insufficient-funds" | "missing-ledger" };

/**
 * Shared boundary for player-initiated cash actions.
 *
 * Domain screens still own their state transition (`onCommit`); this function
 * owns only the atomic action boundary: one lock, one cash debit and one
 * existing-schema ledger entry. Settlement remains in financialCore.
 */
export function commitCashTransaction({
  key,
  cash,
  amount,
  onCashChange,
  onLedger,
  ledgerEntry,
  onCommit,
  lockDurationMs = 350,
  now = Date.now(),
}: TransactionCommitInput): TransactionCommitResult {
  if (!tryAcquireSpendLock(key, now)) return { accepted: false, reason: "duplicate" };
  const release = () => clearSpendLock(key);
  if (!Number.isFinite(amount) || amount < 0) {
    release();
    return { accepted: false, reason: "invalid-amount" };
  }
  if (!canSpend(cash, amount)) {
    release();
    return { accepted: false, reason: "insufficient-funds" };
  }
  if (amount > 0 && (!ledgerEntry || !onLedger)) {
    release();
    return { accepted: false, reason: "missing-ledger" };
  }

  const cashAfter = cashAfterSpend(cash, amount);
  onCashChange(() => cashAfter);
  if (amount > 0 && ledgerEntry && onLedger) onLedger({ ...ledgerEntry, timestamp: ledgerEntry.timestamp || now });
  onCommit();
  setTimeout(release, lockDurationMs);
  return { accepted: true, cashAfter, ledgerEntry };
}
