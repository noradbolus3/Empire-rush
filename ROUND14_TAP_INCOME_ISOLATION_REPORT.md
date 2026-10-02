# Round 14 — Tap Income Isolation

## Status

**Fixed on isolated branch `round-14-remove-tap-income-source`. Not merged into `main`; phone verification is required first.**

The stable Round 13 baseline remains available at tag `stable-round-13`. The current branch was created from the published `main` state and does not modify `main`.

## Exact bug location

The defect was in `src/engine/incomeLedger.ts`, inside `buildIncomeSources`.

### Before

```ts
const tapHourly = Number(
  (clickValue * tapRewardMultiplier(tapsToday) * tapBoostMultiplier * 600).toFixed(2),
);

return [
  ...businessRows,
  {
    label: 'Tap actions',
    hourlyProjected: tapHourly,
    color: INCOME_SOURCE_COLORS.tap,
    note: 'Interactive actions credit immediately; not part of business settlement',
  },
  { label: 'Stocks · quarterly dividends', ... },
];
```

At a `$10` tap value, the `×600` conversion displayed approximately `$6,000/hour`, even though taps were already paid instantly by App’s `earn` handler. This was a reporting/accounting defect: the row contradicted its own note and polluted the projected cashflow total and percentages.

The instant tap handler remains separate in `App.tsx`:

```ts
setCash(n => n + award);
pushIncomeEvent({ source: 'Tap actions', amount: award, category: 'tap' });
setProgression(...);
```

It does not mutate business hourly rates or settlement receivables.

## Corrected calculation

`buildIncomeSources` now accepts only business and investment inputs:

```ts
buildIncomeSources({
  businesses,
  assets,
  holdings,
  businessProfitPerHour: profit,
});
```

The source list now consists of:

1. One row per acquired business, allocated from the real business hourly rate.
2. One stock row for **realized dividend events only**.

```ts
const rawTotal = active.reduce(
  (sum, item) => sum + Math.max(0, item.hourlyNetProfit),
  0,
);

const businessRows = active.map(item => ({
  label: item.name,
  hourlyProjected: rawTotal > 0
    ? businessProfitPerHour * (item.hourlyNetProfit / rawTotal)
    : 0,
}));

const realizedDividend = Math.max(0, realizedDividendAmount || 0);

return [
  ...businessRows,
  {
    label: 'Stocks · realized dividends',
    hourlyProjected: realizedDividend,
    cadence: 'event',
  },
];
```

There is no `clickValue`, `tapsToday`, `tapRewardMultiplier`, `tapBoostMultiplier`, `tapHourly`, or `×600` input in the income ledger anymore.

## Before/after source output

Proof script: `scripts/tap-income-isolation-round14.ts`

### Before

```text
Copper & Bloom Market        +$500/hr
Tap actions                 +$6,000/hr
Stocks · quarterly dividends    $0/hr
```

### After

```text
INCOME SOURCES
Copper & Bloom Market        +$500.00/hr
Stocks · realized dividends     +$0.00/event

GAMEPLAY ACTIVITY
Tap actions: separate Gameplay Activity only
Instant on-tap cash; excluded from projected cashflow
```

The Home cashflow card now says **“business & investment sources”** rather than “tap for sources”. The modal’s `GAMEPLAY ACTIVITY` section separately shows tap count, total tap cash earned, and current reward per tap.

## Required proof cases

| Case | Result |
|---|---|
| Player performs 0 taps | Business source remains `$500/hour`; no tap row exists |
| Player performs 1,000 rapid taps | Income Sources output is byte-for-byte identical to the 0-tap output |
| One business accrues and collects `$500` | Settlement credit is `$500` from **Copper & Bloom Market**, never Tap actions |
| Held stock has dividend yield but no event | Stock source is `$0/event` with note that no quarterly event has settled |
| Actual dividend event of `$125` | Stock source becomes `$125/event`; it is not an hourly tap rate |
| Hardcoded tap hourly cap | **Absent** from production ledger and source list |

The focused proof output is:

```json
{
  "incomeSourcesAfterFix": [
    "Copper & Bloom Market +$500.00 / hr",
    "Stocks · realized dividends +$0.00 / event"
  ],
  "gameplayActivity": "Tap actions: separate Gameplay Activity only; instant on-tap cash; excluded from projected cashflow",
  "zeroTapVsThousandTap": "identical",
  "collectedBusinessCash": "$500 from Copper & Bloom Market",
  "unrealizedStockDividend": "$0",
  "realizedStockDividendExample": "$125 / event",
  "hardcodedTapHourlyCap": "absent"
}
```

## Repository scan interpretation

The final production scan found no tap-hourly formula, `tapIncomePerHour`, `tapHourly`, or `clickIncome` in the ledger or production source. The remaining `6000` matches are unrelated Mobility economics (`electricEVs * 6000`) and are not tap income.

The remaining `Tap actions` matches are intentional and limited to:

- `App.tsx`: instant cash event/toast source.
- `EarningsBreakdownModal.tsx`: separate `GAMEPLAY ACTIVITY` section.
- The proof script and regression assertions.

There is no `Tap actions` row in the `INCOME SOURCES` array.

## Verification

- `npx tsc --noEmit` — **PASS**
- `git diff --check` — **PASS**
- `npx tsx scripts/regression-health.ts` — **PASS**
- `npx tsx scripts/tap-income-isolation-round14.ts` — **PASS**
- `main` merge — **NOT DONE BY DESIGN**; waiting for phone verification.
