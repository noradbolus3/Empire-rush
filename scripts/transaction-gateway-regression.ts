import assert from "node:assert/strict";
import type { BankLedgerEntry } from "../src/types/bank";
import { commitCashTransaction } from "../src/engine/transactionGateway";
import { resetSpendLocks } from "../src/engine/walletGuard";

const baseEntry = (id: string, amount: number): BankLedgerEntry => ({
  id,
  kind: "PURCHASE",
  label: "Gateway regression purchase",
  amount,
  timestamp: 1_700_000_000_000,
  detail: "Shared transaction gateway regression",
});

let cash = 500;
const ledger: BankLedgerEntry[] = [];
let commits = 0;
const onCashChange = (update: (current: number) => number) => { cash = update(cash); };
const onLedger = (entry: BankLedgerEntry) => ledger.push(entry);

const success = commitCashTransaction({
  key: "gateway:success",
  cash,
  amount: 125,
  onCashChange,
  onLedger,
  ledgerEntry: baseEntry("gateway-success", -125),
  onCommit: () => { commits += 1; },
  now: 1_700_000_000_000,
});
assert.equal(success.accepted, true);
assert.equal(cash, 375);
assert.equal(ledger.length, 1);
assert.equal(ledger[0].amount, -125);
assert.equal(commits, 1);

const insufficient = commitCashTransaction({
  key: "gateway:insufficient",
  cash,
  amount: 500,
  onCashChange,
  onLedger,
  ledgerEntry: baseEntry("gateway-insufficient", -500),
  onCommit: () => { commits += 1; },
  now: 1_700_000_000_001,
});
assert.deepEqual(insufficient, { accepted: false, reason: "insufficient-funds" });
assert.equal(cash, 375);
assert.equal(ledger.length, 1);
assert.equal(commits, 1);

const firstDuplicateAttempt = commitCashTransaction({
  key: "gateway:duplicate",
  cash,
  amount: 50,
  onCashChange,
  onLedger,
  ledgerEntry: baseEntry("gateway-duplicate", -50),
  onCommit: () => { commits += 1; },
  now: 1_700_000_000_002,
});
const secondDuplicateAttempt = commitCashTransaction({
  key: "gateway:duplicate",
  cash,
  amount: 50,
  onCashChange,
  onLedger,
  ledgerEntry: baseEntry("gateway-duplicate-2", -50),
  onCommit: () => { commits += 1; },
  now: 1_700_000_000_002,
});
assert.equal(firstDuplicateAttempt.accepted, true);
assert.deepEqual(secondDuplicateAttempt, { accepted: false, reason: "duplicate" });
assert.equal(cash, 325);
assert.equal(ledger.length, 2);
assert.equal(commits, 2);

// A failed attempt releases its lock, so a later retry can succeed after cash changes.
const retryFailed = commitCashTransaction({
  key: "gateway:retry",
  cash,
  amount: 400,
  onCashChange,
  onLedger,
  ledgerEntry: baseEntry("gateway-retry", -400),
  onCommit: () => { commits += 1; },
  now: 1_700_000_000_003,
});
assert.deepEqual(retryFailed, { accepted: false, reason: "insufficient-funds" });
cash = 500;
const retrySucceeded = commitCashTransaction({
  key: "gateway:retry",
  cash,
  amount: 400,
  onCashChange,
  onLedger,
  ledgerEntry: baseEntry("gateway-retry", -400),
  onCommit: () => { commits += 1; },
  now: 1_700_000_000_004,
});
assert.equal(retrySucceeded.accepted, true);
assert.equal(cash, 100);
assert.equal(ledger.length, 3);
assert.equal(commits, 3);

resetSpendLocks();
console.log(JSON.stringify({
  status: "PASS",
  successfulDebits: 3,
  finalCash: cash,
  ledgerEntries: ledger.length,
  ledgerSum: ledger.reduce((sum, entry) => sum + entry.amount, 0),
  commitCallbacks: commits,
  scenarios: ["success", "insufficient-funds", "duplicate", "retry"],
}, null, 2));
