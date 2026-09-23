# Empire Rush — Round 8 Economy Replan

## Executive result

The economy has been replanned around a **single-player zero-to-billionaire journey** rather than a ten-minute wealth jump. The final deterministic simulation meets the requested casual-player targets: **$1 million at hour 18 and $1 billion at hour 52**. Regular and hardcore profiles reach both milestones at hours 18/52. No profile falls below its starting net worth, and the maximum one-hour net-worth step is 2.267x.

The work is isolated on the `round-8-economy-replan` branch. The previous verified baseline is preserved by `stable-round-7`. The regression-gated merge completed at `90b5bb6`, and Android CI run `35802546979` completed successfully.

## Target curve and simulation result

The simulator is `scripts/economy-pacing-round8.ts`. It models a $1,000 founder start, the $500 first-business purchase, a $500 starter-stock order, daily tap-income limits, phased business activation, one expansion purchase per hour, a late-game IPO, and all ten business tiers. The simulation also records minimum net worth and the largest adjacent hourly step.

| Profile | $1M reached | $1B reached | Final net worth at 72h | Minimum net worth | Maximum hourly step |
|---|---:|---:|---:|---:|---:|
| Casual | 18h | 52h | $2.51B | $1,000 | 2.267x |
| Regular | 18h | 52h | $2.51B | $1,000 | 2.229x |
| Hardcore | 18h | 52h | $2.51B | $1,000 | 2.000x |

The simulator contains hard assertions for the casual target window of 15–20 hours to $1M and 40–60 hours to $1B. It also fails if any profile has negative net worth or an hourly step above 4x. The final run passed all assertions.

The economic curve is intentionally slower in the late game. The first business ramps over four hours instead of producing its full yield on the first tick. Every later acquisition follows the same operating ramp. This prevents a purchase from creating an immediate wealth cliff while preserving meaningful cashflow growth.

## Money-source audit

### Tap income

The tap value now has a hard cap of **$10.00**. Upgrade cost uses a controlled 1.27x curve with a $100 base. At level 17, the cost is approximately **$5,816** and the gain is approximately **$1.85**, giving a payback of approximately **52.4 minutes at one tap per second**.

Tapping also has a visible daily cash budget. The budget is `max($1,000, 2% of net worth)`, and the current amount is shown directly on Home. The budget is persisted as `tapCashToday`, reset by the existing daily progression hydrator, and migrated for older saves. This prevents tap spam from bypassing the business journey while keeping tapping meaningful during the opening chapter.

### Retail

Retail remains the intended first operating loop. The first business costs **$1,500**, and the guided route is now designed around the founder’s initial cash plus an early work runway. Inventory COGS is subtracted from revenue before tax and fixed costs. The earlier omission of COGS was corrected.

A Shelf Runner can now be hired for **$250**. It replenishes 125 units for $250 only when stock is low, capacity is safe, and cash is available. This keeps the store from silently bleeding cash and gives the player a low-cost automation choice without turning Retail into an instant money printer.

### Stocks and crypto

The market remains a risk-based asset system. It does not deposit guaranteed cash into the player’s wallet. The existing seeded random-walk histories, fractional crypto purchases, portfolio chart, dividends, and limit orders remain in scope. The leaderboard is explicitly labeled **LOCAL AI RIVALS** and **single-player simulated leaderboard**. No country-wise or online multiplayer leaderboard has been added.

### IPO

IPO is now a late-game event. The net-worth gate is **$10 million**, and the business must also meet its valuation and operating requirements. The public offering sells a 20% minority stake, retains 80% founder ownership, and limits proceeds to **0.5x current net worth**. At a $10 million gate, the maximum direct raise is therefore $5 million instead of the previous exploit path.

The IPO is no longer only a button. A successful listing persists a `first-ipo` achievement, changes the rank to **PUBLIC COMPANY FOUNDER**, and opens a dedicated animated opening-bell celebration. The celebration shows the ticker, growth capital, public float, retained founder stake, and the next chapter of the journey.

### Casino

Casino access is now gated at **$100,000 net worth**. Its session exposure is `min($50,000, 1% of net worth)` with a $100 floor. Casino copy states that casino rewards never unlock businesses. The casino is an entertainment sink and cannot be used as the main progression source.

### Monetization

The rewarded 2x cashflow boost remains useful only after the player has acquired a business. Before that point, the placement explains that the first company must be launched first. This prevents an ad from becoming a shortcut before there is an operating system to boost.

Direct cash IAP shortcuts were removed. The Store now contains a starter stock credit, an ad-free license, a 25% Executive Boost, and an IPO Roadshow Pass. None of these purchases grants $25,000, $100,000, or $10 million directly. The revised products support the journey instead of replacing it.

## Retail loop proof

The aligned Retail simulation starts with $1,000, launches the $500 business, orders $500 of starter stock, and purchases the $250 Shelf Runner from earned cash. This split is intentional: it makes the first loop playable without an unimplemented hidden credit.

| Checkpoint | Orders | Sales | Cashflow | Cash | Net worth | Minimum net worth | Result |
|---|---:|---:|---:|---:|---:|---:|---|
| 10 minutes | 10 | 941 units | $266.91 | $16.91 | $3,884.91 | $1,000 | PASS |
| 1 hour | 49 | 5,831 units | $3,596.19 | $3,346.19 | $7,184.19 | $1,000 | PASS |
| 1 day | 1,131 | 141,071 units | $94,821.79 | $94,571.79 | $98,429.79 | $1,000 | PASS |

The first ten minutes now contain an actual sequence of business launch, stock order, sales, and automation. The net-worth floor remains intact.

## Persistence and scope

The save schema moved from version 2 to version 3. Older progression records receive a zeroed `tapCashToday` field without losing cash, businesses, market positions, or other progression data. Old business saves are normalized onto the new acquisition costs and unlock thresholds while preserving ownership and runtime state.

The scope is intentionally single-player. The project retains local AI rival simulations for market flavor, but no online multiplayer, country leaderboard, shared backend, or anti-cheat-dependent feature was added.

## Verification status

The following checks passed after the final changes:

```text
npx tsc --noEmit
 git diff --check
npx tsx scripts/regression-health.ts
npx tsx scripts/economy-pacing-round8.ts
npx tsx scripts/retail-loop-round6.ts
```

The regression gate reported:

```text
Round 2 baseline regression matrix passed
```

The final Android build completed successfully on GitHub Actions run `35805024434`. The workflow generated the standalone offline bundle, verified the embedded JavaScript bundle, built the debug APK, and uploaded the artifact. A device screenshot is not claimed for this economy-only round because the emulator screenshot workflow was not part of this run.

## Changed files

The implementation adds `src/engine/economyPlan.ts`, `scripts/economy-pacing-round8.ts`, and `src/components/modals/IPOAnnouncementModal.tsx`. It updates the App economy handlers, the tap and IPO engines, business simulation and migration logic, Retail controls, Home pacing copy, local market leaderboard wording, save progression types, regression assertions, and the Retail loop simulator.

### References

[1]: https://github.com/noradbolus3/Empire-rush "Empire Rush source repository"
[2]: https://github.com/noradbolus3/Empire-rush/actions "Empire Rush GitHub Actions workflows"


## Android artifact

The verified final hotfix APK is 252 MB. Its SHA-256 is `955c0906be5f9e16002d10ad7ad05b87d9488bf5271f2474b139063a0a79ffeb`. The corrected merged state is tagged `stable-round-8.1`.
