import assert from "node:assert/strict";
import { completeBankingLicense, BANKING_LICENSE_COST } from "../src/engine/bankingLicenseTransaction";
import { tryAcquireSpendLock } from "../src/engine/walletGuard";
import { DEFAULT_BANKING } from "../src/engine/bankingCompanyEngine";
import type { BankLedgerEntry } from "../src/types/bank";
import type { BankingData } from "../src/types/business";

const timestamp = 1_700_000_000_000;
const base = { ...DEFAULT_BANKING, id: "banking-phase1-proof", name: "Proofline Bank", licenseApproved: false, headquartersOpen: false } as BankingData;

const accepted = completeBankingLicense({ business: base, cash: 600_000, timestamp });
assert.equal(accepted.accepted, true);
if (!accepted.accepted) throw new Error("expected successful license transaction");
assert.equal(accepted.cash, 350_000);
assert.equal(accepted.business.licenseApproved, true);
assert.equal(accepted.business.headquartersOpen, true);
assert.equal(accepted.ledgerEntry.kind, "PURCHASE");
assert.equal(accepted.ledgerEntry.amount, -BANKING_LICENSE_COST);
assert.equal(accepted.ledgerEntry.label, "Banking license · Proofline Bank");
console.log(JSON.stringify({
  scenario: "successful-payment",
  cashBefore: 600_000,
  cashAfter: accepted.cash,
  cashDelta: accepted.cash - 600_000,
  licenseApproved: accepted.business.licenseApproved,
  ledgerEntries: 1,
  ledgerAmount: accepted.ledgerEntry.amount,
}));

const insufficient = completeBankingLicense({ business: base, cash: BANKING_LICENSE_COST - 1, timestamp });
assert.deepEqual(insufficient, { accepted: false, reason: "insufficient-funds" });
console.log(JSON.stringify({
  scenario: "insufficient-funds",
  cashBefore: BANKING_LICENSE_COST - 1,
  stateChanged: false,
  ledgerEntries: 0,
}));

const lockKey = `banking:license:phase1-rapid-${Date.now()}`;
let cash = 600_000;
let business = base;
const ledger: BankLedgerEntry[] = [];
const submit = () => {
  if (!tryAcquireSpendLock(lockKey)) return false;
  // Both rapid submissions intentionally read the same render snapshot, matching React's
  // asynchronous state-update hazard. The lock must decide the second submission.
  const transaction = completeBankingLicense({ business, cash, timestamp });
  if (!transaction.accepted) return false;
  cash = transaction.cash;
  business = transaction.business;
  ledger.push(transaction.ledgerEntry);
  return true;
};

const first = submit();
const second = submit();
assert.equal(first, true);
assert.equal(second, false);
assert.equal(cash, 350_000);
assert.equal(business.licenseApproved, true);
assert.equal(ledger.length, 1);
assert.equal(ledger[0].amount, -BANKING_LICENSE_COST);
console.log(JSON.stringify({
  scenario: "rapid-duplicate-submission",
  firstAccepted: first,
  secondAccepted: second,
  cashAfterBoth: cash,
  totalDebit: 600_000 - cash,
  licenseApproved: business.licenseApproved,
  ledgerEntries: ledger.length,
}));

console.log("BANKING_LICENSE_TRANSACTION_REGRESSION: PASS");
