import assert from "node:assert/strict";
import { cashAfterSpend, canSpend, resolveCashUpdate, sanitizeCash } from "../src/engine/walletGuard";

const negative = resolveCashUpdate(100, (current) => current - 250);
assert.equal(negative, 0);

const nan = resolveCashUpdate(100, () => Number.NaN);
assert.equal(nan, 0);

const infinity = sanitizeCash(Number.POSITIVE_INFINITY);
assert.equal(infinity, 0);

assert.equal(canSpend(100, 100), true);
assert.equal(canSpend(99.99, 100), false);
assert.equal(cashAfterSpend(100, 40), 60);
assert.equal(cashAfterSpend(40, 100), 40);

let cash = 100;
for (let index = 0; index < 10; index += 1) {
  cash = resolveCashUpdate(cash, (current) => current - 25);
}
assert.equal(cash, 0);
assert.ok(cash >= 0);

console.log(JSON.stringify({
  test: "wallet-guard-proof",
  negativeUpdate: negative,
  nanUpdate: nan,
  infiniteInput: infinity,
  exactSpend: cashAfterSpend(100, 40),
  rejectedOverspend: cashAfterSpend(40, 100),
  rapidUpdatesFinalCash: cash,
  status: "PASS",
}, null, 2));
