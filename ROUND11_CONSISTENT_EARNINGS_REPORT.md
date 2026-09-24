# Round 11 — Consistent Command-Deck UI and Transparent Earnings

## Scope

Round 11 standardizes the visual language across Home, Business, Markets, Lifestyle, and Casino while making cash generation inspectable in real time. It intentionally does not rebalance the core economy or add new gameplay loops; those mechanics are the next round's priority.

## Implemented

The Home screen now exposes a tappable **LIVE EARNINGS / SEC** card. The card opens a unified ledger that separates operating businesses by current contribution, daily tap potential, and the portfolio's quarterly-dividend run rate. Existing live EPS behavior remains backed by the business cashflow state; the new rows explain where the displayed yield comes from rather than silently changing the cash rules.

Income events are now source-attributed. Tap awards, passive business ticks, business-screen ticks, founder missions, dividends, and IPO proceeds can produce a short-lived source toast such as `Copper & Bloom Market +$X.XX`. Business ticks use an engine-level `incomeByBusiness` map, so the source label is not guessed from an aggregate number.

Business, Markets, Lifestyle, and Casino now use the same obsidian/emerald/cyan/gold command-deck tokens. Markets also has a founder market-desk hero panel; the existing IPO banner, portfolio curve, AI-rival leaderboard, limit orders, and asset cards remain in place. The screenshot workflow already captures Home, Business, Retail detail, Markets, Lifestyle, and Settings from a standalone Android APK.

## Verification

The following checks passed on the Round 11 branch:

- `npx tsc --noEmit`
- `git diff --check`
- `npx tsx scripts/regression-health.ts` — baseline matrix plus Round 11 ledger and visual assertions
- `npx tsx scripts/ipo-economy-round7.ts` — IPO economy proof remained `PASS` with `maxStepMultiple: 1.5`

Android CI and emulator screenshot artifact status will be appended after the merged build completes. Until that workflow finishes, screenshots are not claimed as device-verified.

## Next round

The next round should focus on gameplay depth rather than another visual pass: timed demand events that create meaningful pricing choices, visible supply constraints, contract risk/reward, and upgrade decisions with clear operational tradeoffs. Online multiplayer and country leaderboards remain out of scope for the single-player core.
