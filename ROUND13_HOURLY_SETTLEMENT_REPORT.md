# Empire Rush — Round 13 Hourly Settlement Fix

## Status

**Fixed on isolated branch `round-13-hourly-settlement`; local regression and TypeScript gates pass.**

The root cause was not the `BusinessScreen` display rate. It was a connected cash-credit path: `BusinessScreen` ran the business simulation every 2 seconds, the simulation converted an hourly figure into a per-tick `cashDelta`, and App credited that value directly to the wallet. A second derived business-profit path made the same unit mistake possible elsewhere.

For a declared `$22,000/hour` Mobility rate, the old interpretation could pay `$22,000 × 1,800 = $39,600,000` per hour. This is why the reported wallet could jump from roughly `$1,030` to `$20,000` in a few seconds when an hourly rate was interpreted as a tick amount.

## Structural fix

### Before

```ts
const result = simulateBusinessTick(businesses, 2, ...);
if (result.cashDelta !== 0) {
  onCashChange(value => Math.max(0, value + result.cashDelta));
}
```

The old simulation returned a value equivalent to:

```ts
cashDelta = hourlyRate * seconds / 3600;
```

That value was then consumed as wallet cash on the simulation cadence rather than at a settlement boundary.

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

The operations engine returns declared rates and accrues a persisted receivable, but never returns or credits `cashDelta`:

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

The settlement engine credits only completed real-time hours, caps offline settlement at 24 hours, retains partial-hour receivables, and clears only the amount actually settled. Pending receivables are included in net worth so a player does not see a false asset-value drop while waiting for the next settlement.

## Exact one-hour proof

Script: `scripts/hourly-settlement-round13.ts`

| Elapsed | Liquid cash | Pending receivable |
|---:|---:|---:|
| 10 minutes | $100,000.00 | $164.45 |
| 59 minutes | $100,000.00 | $2,657.76 |
| 60 minutes | $100,000.00 | $2,705.08 |
| Settlement close | **$102,705.08** | Settled once |

The old interpretation would have produced a declared rate of `$2,860/hour` in the ramped Retail + Mobility fixture, multiplied it by `1,800` two-second ticks, and credited **$5,148,000**. That is **1,903.09×** the correct accrued credit of `$2,705.08`.

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

The after-model uses the production operations engine and includes the four-hour operating ramp, Retail COGS, legal tax, fixed-cost handling, and empty-shelf protection. The before-model documents the old inflated comparison: Retail COGS and tax were omitted, and Mobility began at full speed.

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
- Business cash after settlement: `$668.54`
- Empty shelves do not create rent/payroll bleed
- Result: **PASS**

## UI truthfulness

Home and the App header no longer show `+$X/sec` for passive businesses. They show `+$X/hr projected` and a `NEXT SETTLEMENT` countdown. The tappable breakdown modal reports hourly projections, names each active business source, describes taps as immediate interactive income separate from business settlement, and shows stock dividends as an hourly equivalent with the quarterly distribution explained in the source note.

## Save compatibility

`GAME_SAVE_VERSION` is now `5`. Legacy saves migrate `settlementAt` from the previous `saved` timestamp when available. Pending receivables and accrued seconds are optional fields, so old business records continue to load safely.

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | PASS |
| `npx tsx scripts/regression-health.ts` | PASS — `Round 2 baseline regression matrix passed` |
| `npx tsx scripts/hourly-settlement-round13.ts` | PASS |
| `npx tsx scripts/retail-loop-round6.ts` | PASS |
| `npx tsx scripts/retail-mobility-hour-round11.ts` | PASS |
| `npx tsx scripts/ipo-valuation-round9.ts` | PASS |
| Long-horizon pacing | Casual millionaire hour `18`, billionaire hour `52`; regular `18`/`52`; hardcore `17`/`51`; minimum net worth `$1,000`; maximum step multiple ≤ `2.20` |
| Production payout scan | No `cashDelta`, `incomeByBusiness`, `profitRef`, `perSecond`, `earningsPerSecond`, or `/ sec` matches in App/src |

## Android release proof

The tested branch was built by [Android debug APK workflow run 36343142008](https://github.com/noradbolus3/Empire-rush/actions/runs/36343142008). The source SHA was `510f54b551eb646365b99d0a3cf77d8805e81ae4`, and the workflow completed successfully. Offline JavaScript bundle generation, embedded-bundle verification, clean standalone debug APK compilation, and artifact upload all passed.

The APK is `311,635,244` bytes with SHA-256 `076a85df0f4fa38204afed9627f0d08e34ce0211dc977c8c15e0475f34c48d10`. The stable code tag is `stable-round-13`. The emulator screenshot workflow is not part of this round’s acceptance gate; the APK is standalone and ready for direct phone testing.

## Intentionally untouched

The pre-existing untracked `ROUND5_FINAL_REPORT.md` is unrelated to this fix and was not staged or modified.
