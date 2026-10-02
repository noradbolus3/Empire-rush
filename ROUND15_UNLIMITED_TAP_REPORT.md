# Round 15 — Unlimited Tap Value and Real Ledger Proof

## Status

**Tap-count reduction removed on branch `round-15-unlimited-tap`.** The accepted Round 14 branch remains unchanged and its APK build is running separately.

## Why tap value was previously limited

The previous formula in `src/engine/economyPlan.ts` was:

```ts
const safeTaps = Math.max(0, Number.isFinite(tapsToday) ? tapsToday : 0);
if (safeTaps <= 10) return 1;
return Number(Math.max(0.25, 1 - (safeTaps - 10) * 0.025).toFixed(3));
```

Tap reward was then calculated as:

```ts
clickValue * tapRewardMultiplier(tapsToday) * tapBoostMultiplier
```

This was intended as economy pacing, but it violated the requested design: taps should remain unlimited, with businesses becoming the primary scaling system—not by silently reducing the value of every tap.

## New rule

The tap-count multiplier and its constants were removed entirely.

The new formula is:

```ts
const award = amount
  * (1 + progression.prestigeLevel * 0.05)
  * liveTapBoostMultiplier;
```

The displayed tap amount is:

```ts
const effectiveTapValue = clickValue * tapBoostMultiplier;
```

Therefore:

- `tapsToday` never reduces tap value.
- Tap value remains unlimited in count.
- Normal tap value is controlled by upgrade level, capped at **$10/tap**.
- Tap Overdrive can temporarily provide **2× tap value**.
- Prestige remains a separate multiplier already present in the game.

The Home UI now explicitly says: **“Only upgrades and Tap Overdrive change it.”**

## Real ledger proof

Proof script: `scripts/real-ledger-proof-round15.ts`

Active businesses:

| Business | Hourly rate | Share |
|---|---:|---:|
| Copper & Bloom Market | $578.60/hr | 43.54% |
| Ammu cab | $750.32/hr | 56.46% |
| **Total** | **$1,328.92/hr** | **100.00%** |

Stocks remain `$0` until a realized dividend event occurs.

Verified output:

```json
{
  "projectedCashflowPerHour": 1328.92,
  "percentages": {
    "Copper & Bloom Market": 43.54,
    "Ammu cab": 56.46
  },
  "stocksUntilDividendEvent": 0
}
```

## Pending evidence requested earlier

### App-to-screen import chain

- `App.tsx:10` imports `HomeScreen`, `BusinessScreen`, `MarketScreen`, `LifestyleScreen`, and `CasinoScreen` from `./src/screens`.
- `src/screens/index.ts:1-5` re-exports each screen from its own file:
  - `HomeScreen.tsx`
  - `BusinessScreen.tsx`
  - `MarketScreen.tsx`
  - `LifestyleScreen.tsx`
  - `CasinoScreen.tsx`
- Engine barrel: `src/engine/index.ts:1-8` exports business simulation, market engine, tap upgrade, IPO, income ledger, tap boost, real-time, and settlement engines.

### Date.now()

The canonical system-clock source is:

```text
src/engine/realTimeEngine.ts:9 — return Date.now();
```

Other intentional persistence/business timestamp uses remain in transaction logging, save migration fallback, daily progression, and business actions. The production clock display uses `readSystemTimeMs()` from `realTimeEngine.ts`.

## Verification

- `npx tsc --noEmit` — PASS
- `git diff --check` — PASS
- `npx tsx scripts/regression-health.ts` — PASS
- `npx tsx scripts/real-ledger-proof-round15.ts` — PASS
- `npx tsx scripts/tap-income-isolation-round14.ts` — PASS
- Production scan for `tapRewardMultiplier`, `TAP_SOFT_START_TAPS`, and `TAP_REWARD_FLOOR` — no active production/simulation references
- Round 14 APK build — running on accepted branch `round-14-remove-tap-income-source`
- Round 15 APK build — not started; wait for phone verification of Round 14 before requesting a new APK
- Main merge — not done
