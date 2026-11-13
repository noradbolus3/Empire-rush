import assert from "node:assert/strict";
import {
  daysUntilNextGameQuarter,
  formatGameDate,
  gameCalendarPosition,
  gameQuarterKey,
  isGameQuarterBoundary,
  migrateLegacyLoanDueDay,
} from "../src/engine/gameCalendar";

assert.equal(formatGameDate(0), "Year 1 · Month 1 · Day 1");
assert.equal(formatGameDate(29), "Year 1 · Month 1 · Day 30");
assert.equal(formatGameDate(30), "Year 1 · Month 2 · Day 1");
assert.equal(formatGameDate(359), "Year 1 · Month 12 · Day 30");
assert.equal(formatGameDate(360), "Year 2 · Month 1 · Day 1");
assert.equal(gameQuarterKey(0), "Y1-Q1");
assert.equal(gameQuarterKey(89), "Y1-Q1");
assert.equal(gameQuarterKey(90), "Y1-Q2");
assert.equal(gameQuarterKey(359), "Y1-Q4");
assert.equal(gameQuarterKey(360), "Y2-Q1");
assert.equal(daysUntilNextGameQuarter(0), 90);
assert.equal(daysUntilNextGameQuarter(89), 1);
assert.equal(daysUntilNextGameQuarter(90), 90);
assert.equal(isGameQuarterBoundary(0), false);
assert.equal(isGameQuarterBoundary(90), true);
assert.deepEqual(gameCalendarPosition(-10), {
  year: 1,
  month: 1,
  day: 1,
  completedSettlements: 0,
});
const now = Date.UTC(2026, 10, 12);
assert.equal(migrateLegacyLoanDueDay(now + 15 * 24 * 60 * 60 * 1000, now, 0), 15);
assert.equal(migrateLegacyLoanDueDay(now + 3 * 60 * 60 * 1000, now, 4), 34);
assert.equal(migrateLegacyLoanDueDay(now - 1, now, 7), 7);
assert.equal(migrateLegacyLoanDueDay(Number.NaN, now, 7), 7);

console.log(JSON.stringify({ status: "PASS", calendar: "1 settlement hour = 1 game-day", monthDays: 30, quarterDays: 90 }, null, 2));
