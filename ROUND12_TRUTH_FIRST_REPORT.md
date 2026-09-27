# Empire Rush — Round 12 Truth-First Delivery Report

## Executive result

**Status: fixed and locally verified; APK build green.**

This round removes the accelerated fake calendar from production and makes the app use the phone’s real system clock. The deferred architecture, income transparency, rewarded tap boost, and Retail + Mobility economy proof are connected and covered by regression assertions.

The work is on the isolated branch `round-12-truth-first-realtime` and has **not been merged into `main`**, preserving the safety rule that the user can install and phone-test before merge.

- Source commit: `2b7fa27` (`Replace simulated clock with real system time`)
- Branch: `round-12-truth-first-realtime`
- GitHub Actions run: [36317102336](https://github.com/noradbolus3/Empire-rush/actions/runs/36317102336)
- Build result: **success**
- APK artifact: `empire-rush-debug-apk`
- APK size: 311,635,112 bytes
- APK SHA-256: `e6f395a68d31fb8966a4627fd91a9c80f63084706c57e05d6e82c01d9a57f72c`
- Device/emulator screenshot proof: **not device-verified in this round**; the user can install this APK on the phone.

## Requested item status

| Item | Status | Proof |
|---|---|---|
| Architecture split | **Fixed** | App imports `HomeScreen`, `BusinessScreen`, `MarketScreen`, `LifestyleScreen`, and `CasinoScreen` from `src/screens/index.ts`; no core screen function remains embedded in `App.tsx`. Engine modules are exported through `src/engine/index.ts`. |
| Real-time clock | **Fixed** | `src/engine/realTimeEngine.ts` uses `Date.now()`, local day/week/quarter keys, and local date formatting. App refreshes `systemTimeMs` every real second. The obsolete `src/engine/gameTimeEngine.ts` was removed. |
| Save compatibility | **Fixed** | `GAME_SAVE_VERSION` is now `4`; old IPO `listedAtGameTimestamp` values migrate to `listedAtTimestamp`, and saves receive `timeModel: "system-clock-v1"`. |
| Daily/weekly timing | **Fixed** | Daily progression rehydrates on the real local day key; weekly event state uses the real local week key. |
| Unified income breakdown | **Fixed** | `buildIncomeSources()` reports every acquired business, Tap actions, and quarterly stock dividends. App makes the live EPS badge tappable and opens `EarningsBreakdownModal`. |
| Source indicators | **Fixed** | Business ticks call `onIncome()` and App renders source-labelled transient income toasts such as `Retail +$…`; tap and market paths remain source-aware. |
| Rewarded tap boost | **Fixed** | `watchTapBoost()` uses the existing test rewarded-ad service; a successful reward activates `2×` tap value for **12 real-time minutes**. It is locked until the first business is launched. |
| Business/Markets command-deck wiring | **Fixed** | Both screens are separate modules and use the shared command-deck pulse/palette treatment from the earlier Round 11 work. |
| Retail + Mobility one-hour economy proof | **Fixed** | Dedicated simulation passes with before/after cost and cashflow output below. |
| Emulator screenshot | **Not done / honest limitation** | The APK workflow passed, but screenshot/device proof was not produced in this round. This does not block phone installation testing. |

## Architecture file map

### Screens

- `src/screens/HomeScreen.tsx` — tap command deck, tap feedback, tap upgrade, boost actions, next-goal navigation
- `src/screens/BusinessScreen.tsx` — business registry and business tick integration
- `src/screens/MarketScreen.tsx` — stocks, crypto, charts, limit orders, portfolio, local AI rivals
- `src/screens/LifestyleScreen.tsx` — bundled lifestyle marketplace
- `src/screens/CasinoScreen.tsx` — gated single-player casino flow
- `src/screens/business/BusinessMasterHubScreen.tsx` — business management dashboard
- `src/screens/business/RetailHubScreen.tsx` — Retail operations loop
- `src/screens/index.ts` — explicit screen barrel used by `App.tsx`

### Engines

- `src/engine/businessSimulation.ts` — Retail, Mobility, and sector simulation ticks; ramps; COGS/tax; per-business attribution
- `src/engine/marketEngine.ts` — seeded market histories, ticks, events, dividends, limit-order matching, portfolio values
- `src/engine/tapUpgradeEngine.ts` — tap upgrade costs, gains, and `$10` cap
- `src/engine/ipoEngine.ts` — IPO valuation, net-worth caps, proceeds, ownership dilution
- `src/engine/incomeLedger.ts` — unified Tap/business/stock income source rows
- `src/engine/tapBoostEngine.ts` — 2× tap boost duration and active-state rules
- `src/engine/offlineEarnings.ts` — real elapsed offline earnings with the 24-hour cap
- `src/engine/realTimeEngine.ts` — real phone time, local calendar keys, and formatted timestamp
- `src/engine/saveMigration.ts` — schema migration through version 4
- `src/engine/index.ts` — explicit engine barrel

## Real-time behavior

The old model advanced **5 simulated minutes per real second** from a fixed 1 January 2026 start. That accelerated model is no longer wired into the app.

The production path now does the following:

```ts
const [systemTimeMs, setSystemTimeMs] = useState(() => readSystemTimeMs());

useEffect(() => {
  const syncSystemTime = () => setSystemTimeMs(readSystemTimeMs());
  syncSystemTime();
  const timer = setInterval(syncSystemTime, 1000);
  return () => clearInterval(timer);
}, []);
```

The header displays the local phone date/time. Offline earnings use real elapsed milliseconds between the saved timestamp and the current system timestamp, capped by the existing 24-hour rule.

## Unified income ledger

`src/engine/incomeLedger.ts` now returns:

- one row for every acquired business, including zero-yield ramp rows;
- Tap run-rate after soft diminishing returns and any active tap boost;
- quarterly stock-dividend run-rate.

The live EPS badge is tappable from Home and opens the existing earnings modal with the same source rows. Business tick callbacks emit source-labelled income events instead of changing the cash balance silently.

## Rewarded tap boost

- Reward service: `showTestRewardedAd()` using Google test rewarded ID.
- Multiplier: `2×`.
- Duration: `12 real-time minutes` (`720,000 ms`).
- Guard: unavailable until at least one business is acquired.
- Failure path: no multiplier is applied and the user sees an `AD UNAVAILABLE` alert.

Direct engine probe passed:

```json
{
  "boostDurationMs": 720000,
  "offlineSeconds": 3600,
  "offlineReward": 3600
}
```

## Retail + Mobility: one-hour before/after proof

The dedicated script is `scripts/retail-mobility-hour-round11.ts`.

| Metric | Before old path | After production path |
|---|---:|---:|
| Retail entry | $5,000 | $500 business + $500 starter stock |
| Retail first-hour cashflow | included in $43,402.66 combined path | $401.07 |
| Mobility first-hour cashflow | full-speed path | $2,922.34 |
| Combined first-hour cashflow | **$43,402.66** | **$3,323.41** |
| Current steady hourly cashflow | old full-speed behavior | **$5,815.20** |
| Retail COGS/tax | omitted in old comparison | included |
| Retail fixed costs | not correctly represented | $2,000/month, prorated |
| Operating ramp | none | four real-time hours |
| Empty shelves | could create misleading bleed | $0 sales and no operating-cost bleed |
| Simulation result | exploit-prone | **PASS** |

### Root cause of the old high income

1. Newly acquired businesses began at full hourly output instead of ramping.
2. Mobility began with 10 sedans at `$2,200/hour` each, producing `$22,000/hour` before synergy.
3. The old Retail comparison omitted inventory COGS and legal tax.

### Production fixes

1. New businesses ramp over four real-time hours.
2. Retail subtracts `$2/unit` COGS, `15%` legal tax, and prorated rent/payroll.
3. Empty Retail shelves stop sales and do not bleed rent/payroll in the simulation.
4. The first Retail launch is split into `$500` business acquisition plus `$500` starter stock.

## Verification gates

All passed on commit `2b7fa27`:

- `npx tsc --noEmit`
- `npx tsx scripts/regression-health.ts`
- `git diff --check`
- `npx tsx scripts/retail-mobility-hour-round11.ts`
- Direct real-time helper probe for system timestamp, local day/week, tap boost duration, and offline elapsed earnings
- GitHub Actions standalone Android build
- Offline bundle embedding check: `assets/index.android.bundle`

The regression output remained:

```text
Round 2 baseline regression matrix passed
```

## Build status

The GitHub Actions run passed all required steps:

- Node.js setup
- JDK 17 setup
- Android SDK setup
- Expo prebuild
- build identity injection
- offline JavaScript bundle generation
- Gradle clean + `assembleDebug`
- APK bundle verification
- debug APK upload

`main` remains unchanged after the Round 12 work. Merge should happen only after phone testing confirms the real-time header, Home ledger, tap boost, Business, and Markets flows.
