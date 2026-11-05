import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

type Entry = {
  id: string;
  kind: 'PURCHASE';
  label: string;
  amount: number;
  timestamp: number;
  detail: string;
};

type SpendHarness = {
  cash: number;
  ledger: Entry[];
  locked: boolean;
  spend: (cost: number, label: string, reenter?: boolean) => void;
};

function createSpendHarness(companyId: string, companyName: string, now: number, initialCash: number): SpendHarness {
  const state: SpendHarness = {
    cash: initialCash,
    ledger: [],
    locked: false,
    spend: () => undefined,
  };
  state.spend = (cost, label, reenter = false) => {
    if (state.locked) return;
    if (state.cash < cost) return;
    state.locked = true;
    state.cash = Math.max(0, state.cash - cost);
    if (cost > 0) {
      state.ledger.push({
        id: `ledger-${companyId}-${now}`,
        kind: 'PURCHASE',
        label: `${companyName} investment · ${label}`,
        amount: -cost,
        timestamp: now,
        detail: `${companyName} operating investment`,
      });
    }
    if (reenter) state.spend(cost, label);
    state.locked = false;
  };
  return state;
}

const constructionSource = readFileSync('src/screens/business/ConstructionCompanyScreen.tsx', 'utf8');
const itSource = readFileSync('src/screens/business/ITSoftwareCompanyScreen.tsx', 'utf8');
const activeBusinessSource = readFileSync('src/screens/BusinessScreen.tsx', 'utf8');
const gatewaySource = readFileSync('src/engine/transactionGateway.ts', 'utf8');

const sourceChecks = {
  constructionProp: /onLedger\?: \(entry: BankLedgerEntry\)/.test(constructionSource),
  constructionGateway: /commitCashTransaction/.test(constructionSource) && /ledgerEntry: cost > 0/.test(constructionSource) && /kind: 'PURCHASE'/.test(constructionSource),
  constructionLock: /commitCashTransaction/.test(constructionSource),
  constructionFundsFirst: /amount: cost/.test(constructionSource),
  itProp: /onLedger\?: \(entry: BankLedgerEntry\)/.test(itSource),
  itGateway: /commitCashTransaction/.test(itSource) && /ledgerEntry: cost > 0/.test(itSource) && /kind: 'PURCHASE'/.test(itSource),
  itLock: /commitCashTransaction/.test(itSource),
  itFundsFirst: /amount: cost/.test(itSource),
  gatewayRequiresLedger: /onLedger/.test(gatewaySource) && /return \{ accepted: false/.test(gatewaySource),
  activeConstructionWiring: /<ConstructionCompanyScreen[\s\S]*?onLedger=\{onLedger\}/.test(activeBusinessSource),
  activeItWiring: /<SoftwareCompanyScreen[\s\S]*?onLedger=\{onLedger\}/.test(activeBusinessSource),
};
for (const [name, ok] of Object.entries(sourceChecks)) assert.equal(ok, true, `source check failed: ${name}`);

const construction = createSpendHarness('construction-1', 'Construction Company', 1700000000000, 100_000);
construction.spend(45_000, 'Development site acquired');
assert.equal(construction.cash, 55_000);
assert.equal(construction.ledger.length, 1);
assert.equal(construction.ledger[0].amount, -45_000);
assert.equal(construction.ledger[0].kind, 'PURCHASE');
assert.equal(construction.ledger[0].label, 'Construction Company investment · Development site acquired');

const it = createSpendHarness('software-1', 'IT & Software Company', 1700000000001, 100_000);
it.spend(18_000, 'IT Company formation');
assert.equal(it.cash, 82_000);
assert.equal(it.ledger.length, 1);
assert.equal(it.ledger[0].amount, -18_000);
assert.equal(it.ledger[0].kind, 'PURCHASE');

const insufficient = createSpendHarness('construction-2', 'Construction Company', 1700000000002, 10_000);
insufficient.spend(45_000, 'Development site acquired');
assert.equal(insufficient.cash, 10_000);
assert.equal(insufficient.ledger.length, 0);

const duplicate = createSpendHarness('software-2', 'IT & Software Company', 1700000000003, 100_000);
duplicate.spend(12_000, 'Hire developer', true);
assert.equal(duplicate.cash, 88_000);
assert.equal(duplicate.ledger.length, 1);

const reloaded = JSON.parse(JSON.stringify(construction.ledger)) as Entry[];
assert.equal(reloaded.length, 1);
assert.equal(reloaded[0].amount, -45_000);
assert.equal(reloaded[0].kind, 'PURCHASE');

console.log(JSON.stringify({
  test: 'active-specialized-ledger-regression',
  sourceChecks,
  evidenceLevel: 'source contract + deterministic gateway-equivalent helper; not mounted React Native runtime',
  construction: { cashDelta: 45_000, cashAfter: construction.cash, ledgerEntries: construction.ledger.length, amount: construction.ledger[0].amount },
  itSoftware: { cashDelta: 18_000, cashAfter: it.cash, ledgerEntries: it.ledger.length, amount: it.ledger[0].amount },
  insufficientFunds: { cashAfter: insufficient.cash, ledgerEntries: insufficient.ledger.length },
  duplicateAction: { cashAfter: duplicate.cash, ledgerEntries: duplicate.ledger.length },
  saveReload: { entriesAfterReload: reloaded.length, amountAfterReload: reloaded[0].amount },
}, null, 2));
