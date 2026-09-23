# Round 9 — Structural IPO Valuation Fix

## Status

**Fixed and merged.** The structural fix is in `main` at merge commit `ad6c7a5`. Regression, valuation, and standalone Android build verification all pass. The previous implementation changed the proceeds cap but still allowed valuation to be calculated from a contaminated runtime profit field. This round fixes that root cause structurally.

## Root cause

The previous IPO formula used the mutable `business.hourlyNetProfit` field:

```ts
const annualizedProfit = Math.max(0, business.hourlyNetProfit) * 24 * 365;
const operatingBase = business.acquisitionCost + (business.isAcquired ? business.acquisitionCost * 0.5 : 0);
const sectorMultiple = business.sector === 'Tech_SaaS' ? 2.4 : business.sector === 'Construction_Mega' ? 1.8 : business.sector === 'Mobility' ? 1.35 : 1.15;
return Math.max(0, Math.round((operatingBase + annualizedProfit * sectorMultiple) / 1000) * 1000);
```

That field was not a fundamental profit field. `simulateBusinessTick` overwrote it after applying passive wealth scaling, synergy, founder ownership dilution, and the operating ramp. IPO then annualized that already-scaled number again. This is why an old or high-net-worth save could produce a valuation of $300M+ and a direct cash raise around $23M.

The valuation was therefore not inverted because revenue was directly larger than profit. The primary defect was **using the post-multiplier runtime field as if it were raw operating profit**. The secondary design defect was the absence of a valuation-to-player-net-worth ceiling inside the valuation function itself.

## Structural fix

Every business tick now preserves a separate `baseHourlyNetProfit`. This field represents the raw sector operating result before passive wealth scaling, founder ownership, synergy, or ramp effects. IPO valuation reads this raw field and never reads the contaminated post-multiplier value.

The new formula is:

```ts
const rawProfit = rawOperatingProfitPerHour(business);
const annualizedProfit = rawProfit * 24 * 365;
const rawValuation = operatingAssetBase(business)
  + annualizedProfit * (sectorMultiples[business.sector] ?? 1.1);
const cappedValuation = Math.min(
  rawValuation,
  playerNetWorth * IPO_MAX_VALUATION_TO_NET_WORTH_MULTIPLE,
);
return Math.max(0, Math.round(cappedValuation / 1000) * 1000);
```

The production constant is:

```ts
export const IPO_MAX_VALUATION_TO_NET_WORTH_MULTIPLE = 4;
```

This is a **4x upper cap**, which is inside the requested 2–4x range. I did not add an artificial 2x floor: guaranteeing a minimum valuation would create another free-money exploit for a weak or zero-profit company. A company can be below 2x when its actual fundamentals are below that level, but it can never exceed 4x through valuation math.

The proceeds cap remains separate and stricter:

```ts
export const IPO_MAX_NET_WORTH_PROCEEDS_MULTIPLE = 0.5;
```

Therefore the maximum direct IPO cash is 0.5x player net worth, while the displayed/company valuation is capped at 4x player net worth. The public offering still sells 20% and retains 80% founder ownership.

## Legacy-save protection

`capIPOProceeds` now also normalizes old listings before they are shown or traded:

```ts
const valuationAtIPO = Math.min(
  Math.max(0, listing.valuationAtIPO),
  safeNetWorth * IPO_MAX_VALUATION_TO_NET_WORTH_MULTIPLE,
);
const ipoPrice = Number((valuationAtIPO / Math.max(1, listing.sharesOutstanding)).toFixed(2));
return {
  ...listing,
  valuationAtIPO,
  ipoPrice,
  currentPrice: ipoPrice,
  capitalRaised: Math.min(
    Math.max(0, listing.capitalRaised),
    safeNetWorth * IPO_MAX_NET_WORTH_PROCEEDS_MULTIPLE,
  ),
};
```

App hydration calls this normalization before the player-company asset is inserted into the market. An old listing showing $300M valuation at $25M net worth is rewritten to at most $100M valuation, and its share price/history are scaled to that corrected valuation.

## Side-by-side valuation proof

The proof fixture uses the same acquired Retail company in both cases. It has raw operating profit of $25,000 per hour and a 1.15 Retail sector multiple. Only player net worth changes.

| Case | Player net worth | Raw valuation before cap | Maximum allowed valuation | Final valuation | Valuation / net worth |
|---|---:|---:|---:|---:|---:|
| A | $10,000,000 | Above cap | $40,000,000 | **$40,000,000** | **4.00x** |
| B | $50,000,000 | Above cap | $200,000,000 | **$200,000,000** | **4.00x** |

The larger company/net-worth case is higher: **$200M > $40M**. The order is no longer inverted.

The proof command is:

```text
npx tsx scripts/ipo-valuation-round9.ts
```

Its result is `PASS`.

## IPO cash proof

The IPO-inclusive simulation still shows the direct exploit comparison:

| Path | Pre-IPO net worth | IPO cash injection | Immediate post-IPO net worth | Multiple |
|---|---:|---:|---:|---:|
| Legacy exploit | $1,000,000 | $22,800,000 | $23,800,000 | 23.80x |
| Fixed path | $1,000,000 | $500,000 | $1,500,000 | 1.50x |

The fixed path also reduces future founder cashflow to 80% ownership. The observed maximum step in the IPO simulation is 1.5x, and the simulation returns `PASS`.

## Verification

The following checks pass on the isolated branch:

```text
npx tsc --noEmit
git diff --check
npx tsx scripts/regression-health.ts
npx tsx scripts/ipo-valuation-round9.ts
npx tsx scripts/ipo-economy-round7.ts
```

Regression output:

```text
Round 2 baseline regression matrix passed
```

The item is now **merged and APK-built**. GitHub Actions run `35853382259` generated the standalone offline bundle, verified the embedded JavaScript bundle, built the debug APK, and uploaded the artifact. The corrected behavior is tagged `stable-round-9`.

## Changed files

The structural implementation changes `src/engine/ipoEngine.ts`, `src/engine/businessSimulation.ts`, `src/types/business.ts`, `src/components/modals/IPOLaunchModal.tsx`, `App.tsx`, and `scripts/regression-health.ts`. The new reproducible proof is `scripts/ipo-valuation-round9.ts`.

### References

[1]: https://github.com/noradbolus3/Empire-rush "Empire Rush source repository"
[2]: https://github.com/noradbolus3/Empire-rush/actions "Empire Rush GitHub Actions workflows"

## Verified Android artifact

The Round 9 APK is 252 MB. Its SHA-256 is `5b789cfa71072ddf877f8db5085f15f1319855e6aac406b1caf99b80f51367ee`.
