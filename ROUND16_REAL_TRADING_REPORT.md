# Empire Rush — Round 16 Real Trading

## Status

**Implemented on the isolated `round-16-real-trading` branch.** The branch includes the accepted Round 14 tap-income isolation commit, the Round 15 unlimited-tap commit, and the Round 16 trading commit `ea3ed3c`.

`main` was not changed. The user requested phone verification before merge, so merge status is **not done by design** until that verification is complete.

## What changed

### Portfolio accounting

Every persisted holding now has:

- `shares`
- `avgPrice`, the weighted average cost basis
- `realizedPnl`, accumulated on completed sells

A legacy holding without `avgPrice` is migrated using its current saved asset price as the starting cost basis. The save schema is now version **6**. The migration preserves existing quantities and realized values and initializes missing trade history to an empty list.

The weighted-average buy formula is:

```ts
newAverageCost =
  (oldAverageCost * oldQuantity + executionPrice * buyQuantity)
  / (oldQuantity + buyQuantity)
```

Selling does not change the remaining average cost. It records:

```ts
realizedPnl = (executionPrice - averageCost) * sellQuantity
```

Unrealized P&L is marked to the current market price:

```ts
unrealizedPnl = (currentPrice - averageCost) * quantity
```

The market summary now reports **Total Invested**, **Current Value**, **Unrealized P&L**, and **Realized P&L** independently.

### Bulk trading and previews

The trade desk supports quantity presets **1, 10, 100**, a custom quantity, and percentage controls:

- Buy: **25%, 50%, 75%, MAX** of available cash.
- Sell: **25%, 50%, 75%, SELL ALL** of the current holding.
- Stocks use whole shares.
- Crypto uses fractional quantities with eight-decimal precision.

Before execution, the modal shows quantity, execution price, notional, cash after trade, expected sell P&L, and any estimated price impact. Orders using more than 50% of available cash require an explicit confirmation dialog. A short-lived trade lock rejects rapid duplicate execution. Cash is clamped at zero in the execution engine and cannot become negative.

Limit orders use the same quantity and percentage controls. They are fully cash-covered for buys, reserve available sell quantity against open sell orders, and settle through the same weighted-cost and realized-P&L path when filled.

### Price impact

Large orders use a bounded impact model in `src/engine/tradeEngine.ts`:

```ts
threshold = crypto ? 5 : 100
impact = 0                                      // at or below threshold
impact = min(0.03, ((quantity - threshold) / depth) * 0.04)
```

A buy executes at `price * (1 + impact)`. A sell executes at `price * (1 - impact)`. The result is capped at **3%**. The requested 100-share stock test is at the threshold, so it has no impact. A 1,000-share stock order has a measured impact of **0.36%** in the proof.

## Exact proof output

The executable proof is `scripts/trading-proof-round16.ts`.

| Test | Result |
|---|---:|
| `$10,000` stock MAX buy at `$100` | `100` shares, `$0` cash, `$100` average cost |
| Price moves to `$110` | `+$1,000` unrealized P&L |
| Sell 50% | `50` shares sold, `+$500` realized P&L |
| Remaining position | `50` shares at `$100` average cost |
| Crypto fractional MAX at `$0.72` with `$10` cash | `13.86806598` units, `$0` cash |
| Legacy save migration | schema `6`, missing cost basis starts at `$100` current price |
| 1,000-share price impact | `0.36%`, bounded below `3%` |
| Portfolio summary after the partial sell | `$5,000` invested, `$5,500` current value, `+$500` unrealized, `+$500` realized |

The proof passed with `npx tsx scripts/trading-proof-round16.ts`.

## Regression and build gates

The following local gates passed on the branch:

```text
npx tsc --noEmit
npx tsx scripts/regression-health.ts
npx tsx scripts/trading-proof-round16.ts
git diff --check
```

The regression output was:

```text
Round 2 baseline regression matrix passed
```

The existing Round 14 tap-income isolation and Round 15 unlimited-tap code are in the branch ancestry:

```text
ea3ed3c Implement real portfolio P&L and bulk trading
af438a3 Make tap value unlimited by tap count
7ab311b Remove tap rewards from projected income sources
```

## New and changed trading modules

- `src/engine/portfolioEngine.ts` — migration, weighted cost basis, P&L, and portfolio summaries.
- `src/engine/tradeEngine.ts` — quantity sizing, preview validation, price impact, wallet-safe execution.
- `src/types/market.ts` — trade records, portfolio points, limit-order and rival types.
- `src/types/marketAsset.ts` — backward-compatible realized-P&L field.
- `src/engine/saveMigration.ts` — schema version 6 and legacy holding migration.
- `src/screens/MarketScreen.tsx` — P&L cards, summary, bulk controls, trade preview, limit-order desk, rival ranking, portfolio curve, and trade log.
- `App.tsx` — persisted trade history, normalized hydration, market execution, limit fills, and updated MarketScreen wiring.

## Source file listing

```text
src/components/CommandDeckPulse.tsx
src/components/SparklineChart.tsx
src/components/WealthCard.tsx
src/components/modals/BusinessRegistrationModal.tsx
src/components/modals/EarningsBreakdownModal.tsx
src/components/modals/IPOAnnouncementModal.tsx
src/components/modals/IPOLaunchModal.tsx
src/config/buildInfo.ts
src/context/GameContext.tsx
src/context/NetworkContext.tsx
src/data/businesses.ts
src/data/lifestyleAssets.ts
src/data/lifestyleCatalog.ts
src/engine/businessEngine.ts
src/engine/businessSimulation.ts
src/engine/economyPlan.ts
src/engine/incomeLedger.ts
src/engine/index.ts
src/engine/ipoEngine.ts
src/engine/marketEngine.ts
src/engine/offlineEarnings.ts
src/engine/portfolioEngine.ts
src/engine/realTimeEngine.ts
src/engine/saveMigration.ts
src/engine/settlementEngine.ts
src/engine/tapBoostEngine.ts
src/engine/tapUpgradeEngine.ts
src/engine/tradeEngine.ts
src/screens/BusinessDetailScreen.tsx
src/screens/BusinessExpansionScreen.tsx
src/screens/BusinessFinancialsScreen.tsx
src/screens/BusinessScreen.tsx
src/screens/BusinessSupplyChainScreen.tsx
src/screens/BusinessWorkforceScreen.tsx
src/screens/CasinoScreen.tsx
src/screens/HomeScreen.tsx
src/screens/LifestyleScreen.tsx
src/screens/MarketScreen.tsx
src/screens/business/BusinessMasterHubScreen.tsx
src/screens/business/RetailHubScreen.tsx
src/screens/business/businessNavigation.ts
src/screens/index.ts
src/services/notifications.ts
src/services/rewardedAds.ts
src/types/business.ts
src/types/game.ts
src/types/income.ts
src/types/ipo.ts
src/types/ipoAssets.ts
src/types/market.ts
src/types/marketAsset.ts
src/types/progression.ts
src/types/retail.ts
src/types/settlement.ts
src/utils/formatCurrency.ts
```

## Android and merge status

The combined branch build passed in GitHub Actions: [workflow run 36415728243](https://github.com/noradbolus3/Empire-rush/actions/runs/36415728243). The verified artifact is `empire-rush-round16-real-trading-debug.apk`, size 311,652,396 bytes, SHA-256 `ef28a26cb4d20505e66bb4cd6df0c51ae056f39d481760b347e8f1ccd0471960`. The APK contains `assets/index.android.bundle`, so it is packaged for standalone offline launch. `main` remains unchanged pending phone verification.

## References

[1]: https://github.com/noradbolus3/Empire-rush "Empire Rush source repository"
