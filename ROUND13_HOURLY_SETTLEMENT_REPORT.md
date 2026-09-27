# Empire Rush — Round 13 Hourly Settlement Fix

## Status

**Fixed on isolated branch `round-13-hourly-settlement`; local regression and TypeScript gates pass.**

The root cause was not the `BusinessScreen` display rate. It was a connected cash-credit path:

1. `BusinessScreen` called `simulateBusinessTick(..., 2, ...)` every 2 seconds.
2. The simulation converted an hourly figure into `cashDelta = hourlyRate * seconds / 3600`.
3. App credited that delta every 2 seconds through `setCash(...)`.
4. A second App timer also used the derived business profit as if it were a per-tick amount.

For a declared `$22,000/hour` Mobility rate, the first path alone paid `$22,000 × 1,800 = $39,600,000` per hour. This explains the reported `$1,030 → $20,000` jump in a few seconds when a high hourly rate was interpreted as a tick amount.

## Structural fix

### Before

```ts
const result = simulateBusinessTick(businesses, 2, ...);
if (result.cashDelta !== 0) {
  onCashChange(value => Math.max(0, value + result.cashDelta));
}
```

And the simulation returned:

```ts
cashDelta = hourlyRate * seconds / 3600;
```

### After

`BusinessScreen` now runs operating-state updates only:

```ts
const result = simulateBusinessOperations(
  businesses,
  2,
  constructionSeconds,
  cash,
  ownershipFractions,
  netWorth,
);
setBusinesses(result.businesses);
```

The operations engine returns declared rates and accrues a persisted receivable, but **never returns or credits `cashDelta`**:

```ts
return {
  ...business,
  hourlyNetProfit: declaredHourlyRate,
  pendingSettlementAmount: pendingAmount,
  settlementAccruedSeconds: accruedSeconds,
};
```

App has one wallet-credit path:

```ts
const result = settleElapsedBusinessIncome(
  businesses,
  lastSettlementAtMs,
  systemTimeMs,
);
setCash(value => value + result.totalAmount * multiplier);
```

The settlement engine:

- credits only completed real-time hours;
- caps offline elapsed settlement at 24 hours;
- retains partial-hour receivables instead of double-paying or losing them;
- clears only the amount actually settled;
- preserves pending receivables in net worth so the player does not see a false asset-value drop while waiting for the next settlement.

## Exact one-hour proof

Script: `scripts/hourly-settlement-round13.ts`

| Elapsed | Liquid cash | Pending receivable |
|---:|---:|---:|
| 10 minutes | $100,000.00 | $164.45 |
| 59 minutes | $100,000.00 | $2,657.76 |
| 60 minutes | $100,000.00 | $2,705.08 |
| Settlement close | **$102,705.08** | Settled once |

The old interpretation would have produced:

- Declared rate: `$2,860/hour` in the ramped Retail + Mobility fixture
- 2-second ticks per hour: `1,800`
- Wrong one-hour credit: **$5,148,000**
- Wrong-path inflation relative to the correct accrued credit: **1,903.09×**

Result: **PASS**.

## Retail + Mobility before/after proof

Script: `scripts/retail-mobility-hour-round11.ts`

| Metric | Before | After |
|---|---:|---:|
| Retail entry | $5,000 | $500 |
| Retail + Mobility first-hour cashflow | $43,402.66 | **$2,765.67** |
| Retail first-hour settlement | COGS/tax omitted | **$401.07** |
| Mobility first-hour settlement | Full speed immediately | **$2,364.60** |
| Settlement cadence | Per-tick interpretation | **One whole-hour credit** |

The first-hour after-model uses the real production operations engine and includes the four-hour operating ramp, Retail COGS, legal tax, fixed-cost handling, and empty-shelf protection.

## Retail loop proof

Script: `scripts/retail-loop-round6.ts`

- Starting cash: `$1,000`
- Business purchase: `$500`
- Starter stock order: `$500 for 250 units`
- 10-minute orders: `1`
- 10-minute sales: `250 units`
- 10-minute net worth: `$1,168.54`
- Minimum net worth: `$1,000` — **no false loss**
- One-hour cashflow credited: `$668.54`
- Business cash: `$668.54`
- Empty shelves do not create rent/payroll bleed
- Result: **PASS**

## UI truthfulness

- Home and App header no longer show `+$X/sec` for passive businesses.
- They show `+$X/hr projected` and `NEXT SETTLEMENT · ...`.
- The tappable breakdown modal now reports hourly projections.
- Each active business remains visible as a named source.
- Taps remain immediate interactive income and are explicitly labeled as separate from business settlement.
- Stock dividends are shown as an hourly equivalent with the quarterly distribution described in the source note.

## Save compatibility

`GAME_SAVE_VERSION` is now `5`.

Legacy saves migrate `settlementAt` from the previous `saved` timestamp when available. Pending receivables and accrued seconds are optional fields, so old business records continue to load safely.

## Verification

- `npx tsc --noEmit` — **PASS**
- `npx tsx scripts/regression-health.ts` — **PASS** (`Round 2 baseline regression matrix passed`)
- `npx tsx scripts/hourly-settlement-round13.ts` — **PASS**
- `npx tsx scripts/retail-loop-round6.ts` — **PASS**
- `npx tsx scripts/retail-mobility-hour-round11.ts` — **PASS**
- `npx tsx scripts/ipo-valuation-round9.ts` — **PASS**
- `npx tsx scripts/economy-pacing-round8.ts` — casual millionaire hour `18`, billionaire hour `52`; regular `18`/`52`; hardcore `17`/`51`; all minimum net worth values `$1,000`; maximum one-hour step multiple ≤ `2.20`.
- Production scan for `cashDelta`, `incomeByBusiness`, `profitRef`, `perSecond`, `earningsPerSecond`, and `/ sec` in App/src — **no matches**.

## Intentionally untouched

The pre-existing untracked `ROUND5_FINAL_REPORT.md` is unrelated to this fix and was not staged or modified.
