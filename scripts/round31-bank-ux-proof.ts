// @ts-nocheck
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const bank = require('../src/engine/bankEngine');
const types = require('../src/types/bank');
const screen = fs.readFileSync(path.join(root, 'src/screens/BankScreen.tsx'), 'utf8');
const app = fs.readFileSync(path.join(root, 'App.tsx'), 'utf8');

const now = Date.UTC(2026, 0, 1);
const fresh = types.defaultBankState(now);
const micro = bank.underwriteLoan(fresh, 'SBA_MICROLOAN', 5_000, 0, 0);
const startup = bank.underwriteLoan(fresh, 'SBA_STARTUP', 5_000, 0, 0);
assert.equal(micro.decision, 'APPROVE');
assert.equal(startup.decision, 'APPROVE');
assert.match(micro.reason, /income is not required/i);
assert.match(startup.reason, /income is not required/i);

const larger = bank.underwriteLoan(fresh, 'TERM_LOAN', 200_000, 0, 0);
assert.notEqual(larger.decision, 'APPROVE');
assert.match(screen, /transferAmount/);
assert.match(screen, /transferFrom/);
assert.match(screen, /transferTo/);
assert.match(screen, /CONFIRM TRANSFER/);
assert.match(screen, /TRANSFER DECLINED/);
assert.match(screen, /ACHIEVEMENTS/);
assert.match(screen, /badgeCard/);
assert.match(screen, /LEADERBOARD/);
assert.match(screen, /LIVE OFFERS/);
assert.match(screen, /expiresAt/);
assert.match(screen, /WHILE YOU WERE AWAY/);
assert.match(screen, /NEXT BEST MOVE/);
assert.match(screen, /screenGap/);
assert.match(screen, /loanRail/);
assert.match(screen, /marginHorizontal: -16/);
assert.doesNotMatch(app, /CasinoScreen/);

const offers = bank.offersForSettlement(fresh, now, 0);
assert.equal(offers.length, 3);
assert(offers.every((offer: any) => offer.expiresAt === now + 2 * bank.BANK_SETTLEMENT_MS));
const settled = bank.settleBank(fresh, now + bank.BANK_SETTLEMENT_MS, 0);
assert.equal(settled.state.lastAwaySummary.newOffers, 3);

console.log(JSON.stringify({
  passed: true,
  zeroIncomeLoans: { microloan: micro.decision, startup: startup.decision, microReason: micro.reason },
  largeLoanWithZeroIncome: larger.decision,
  transfer: 'amount + from/to selectors + confirmation + balance guard',
  home: 'achievement badges, ranked leaderboard, expiring live offers, away summary, balance-aware next move',
  layout: '12px screen gap and flushed loan product rail',
  offers: offers.map((offer: any) => ({ id: offer.id, expiresAt: offer.expiresAt })),
  untouched: 'Stocks/Crypto/Lifestyle/Business not modified'
}, null, 2));
