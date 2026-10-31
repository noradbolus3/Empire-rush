import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.join(process.cwd(), "src/screens/BankScreen.tsx"), "utf8");

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// These source-backed checks intentionally fail on the pre-fix implementation.
const taxPanel = source.slice(source.indexOf('function TaxPanel'), source.indexOf('function History'));
assert(
  taxPanel.includes("Not enough cash to pay this tax."),
  "TAX FAIL: TaxPanel has no explicit insufficient-cash rejection message",
);
assert(
  taxPanel.includes("commitCashTransaction"),
  "TAX FAIL: TaxPanel does not use the shared transaction gateway",
);
assert(
  taxPanel.includes("taxObligationId") && taxPanel.includes("status === \"PAID\""),
  "TAX FAIL: TaxPanel has no persisted obligation idempotency guard",
);

const loanBlock = source.slice(source.indexOf('const applyLoan'), source.indexOf('const prepayLoan'));
assert(
  loanBlock.includes("origination fee") || loanBlock.includes("originationFee"),
  "LOAN FAIL: Loan acceptance has no explicit origination-fee ledger treatment",
);
assert(
  (loanBlock.match(/addLedger\(/g) || []).length >= 2,
  "LOAN FAIL: Loan acceptance does not emit separate gross and fee ledger entries",
);

const depositBlock = source.slice(source.indexOf('const open ='), source.indexOf('const insure ='));
assert(
  depositBlock.includes('"DEPOSIT"') && depositBlock.includes('-amount'),
  "DEPOSIT FAIL: Deposit opening ledger sign does not match the cash debit",
);

console.log("BANK_P0_REGRESSION: PASS");
