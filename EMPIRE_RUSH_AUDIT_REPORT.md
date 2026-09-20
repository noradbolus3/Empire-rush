# Empire Rush QA Audit and Upgrade Report

**Audit scope:** Expo/React Native Android simulator, local persistence, economy, business operations, public offering flow, market trading, home clicker, responsive UI, and offline distribution.

## Executive conclusion

The audit found several production-impacting defects in the previous build. The most important were a persistence timer that could be repeatedly reset by live state changes, offline earnings that were disabled while the device was offline, a race that could overwrite saved business data with defaults, a debug purchase fallback that granted rewards without a confirmed purchase, stale holding updates during rapid trading, and retail settlement that credited revenue without deducting operating costs.

These defects were corrected and validated with TypeScript, whitespace checks, a standalone bundle generation pass, and deterministic economy tests. The local Android SDK is not installed in this sandbox, so a local Gradle APK could not be verified here. The repository workflow remains the authoritative Android build path and already verifies that `index.android.bundle` is embedded in the APK.

## Severity-ranked findings and fixes

| Severity | Finding | Correction | Verification |
|---|---|---|---|
| Critical | The five-second save interval lived inside an effect that depended on rapidly changing cash, assets, holdings, and business state. The interval could be cleared before its first save. | Added a latest-state ref, a stable save timer, immediate save after hydration, and persistence for progression and preferences. | TypeScript check, diff check, source audit. |
| Critical | Offline earnings were paid only when `isOnline` was true and were limited to two hours. | Offline settlement now works without internet for up to 24 hours, with corrupt-save recovery and clock-tamper protection. | Deterministic source audit and persistence-path review. |
| Critical | `GameContext` could persist default businesses before asynchronous hydration completed, creating a save overwrite race. | Persistence is gated until hydration completes. | Context review and TypeScript check. |
| Critical | A failed or unavailable purchase applied the fallback reward in the debug build. | Rewards now apply only after a purchase object is returned and the transaction is finished. Non-functional theme SKUs were removed. | Store source audit and TypeScript check. |
| High | Rapid buy/sell taps used a stale holdings object and could lose transactions. | Functional holding updates and a short trade lock now serialize rapid actions. | Source audit. |
| High | Unified retail settlement credited revenue while ignoring COGS, rent, payroll, and legal tax. | Retail ticks now deduct wholesale COGS, monthly rent, monthly payroll, and legal tax before calculating cash delta and hourly profit. | Deterministic economy test. |
| High | Business actions and passive settlement could push the wallet below zero. | Spend paths and passive payouts clamp wallet balance to zero and guard repeated actions. | Source audit and deterministic tests. |
| High | A public company could be sent through the IPO launch flow again. | Public listings are now read-only in the modal and cannot issue a duplicate offering. | IPO source review. |
| High | Lifestyle cards depended on remote Unsplash images and could appear broken in an offline APK. | Lifestyle cards now use bundled, deterministic visual treatments and remain functional offline. | Offline asset-path audit. |
| High | The root app used React Native `SafeAreaView` plus manual top padding. This could double-pad some devices and leave bottom navigation exposed. | The app now uses `react-native-safe-area-context` for all edges. | Source review. |
| Medium | The home clicker layout could become too compressed on short screens. | The home surface now scrolls safely with bottom navigation clearance. | TypeScript and layout-source review. |
| Medium | Market filters had no visible empty state. | Added a clear no-match state that explains how to recover. | TypeScript check. |
| Medium | Repeated actions did not consistently expose user preferences. | Added settings for haptics, sound preference, quiet notifications, and privacy/terms summaries. | TypeScript check. |
| Medium | The game lacked a short ethical return loop. | Added persisted daily login streaks, founder rank titles, a 25-tap daily mission, and a one-time $1,000 completion reward. | Deterministic progression tests. |

## Deterministic tests completed

The audit test suite verifies that an acquired retail business deducts only the configured tick quantity, credits net cash after COGS and tax, reports zero cash and hourly profit when shelves are empty, increments a consecutive daily streak, resets a missed streak, and formats `NaN` or infinity as a safe zero currency value. The suite completed successfully with the message `Empire Rush audit tests passed`.

The standalone JavaScript bundle was regenerated with the required Android command. TypeScript validation and `git diff --check` also completed successfully.

## US audience and retention upgrade

The product language now uses American business references such as Main Street, Wall Street, the Federal Reserve, clean-energy growth, EV tax credits, cashflow, founder ranks, and public-company listings. The short-term loop is now explicit: **tap, earn, upgrade, complete a daily founder mission, acquire a business, and scale toward the next unlock**.

The new rank ladder is based on net worth: **Startup Founder**, **Business Owner**, **Tycoon**, and **Mogul**. Daily progress is stored locally, and the mission can be completed without payment or advertising. This keeps the retention mechanic visible without making progress dependent on a purchase.

## Monetization status

The store now follows a safer purchase contract: the game requests a platform product, waits for a returned purchase, applies the reward only after confirmation, and finishes the transaction. The remaining setup is operational rather than UI work: product IDs must be created in Google Play Console, product metadata must match the IDs, and a licensed test account must complete the end-to-end billing test.

Rewarded advertising is not claimed as complete in this audit. A production AdMob implementation still requires platform app IDs, test-device configuration, consent handling, and a real rewarded placement. No dark-pattern purchase fallback was retained.

## Change log

### Added

- Persisted daily login streak, daily tap mission, founder rank, tap count, and upgrade count.
- Settings and trust surface with haptics, sound preference, quiet-notification preference, privacy summary, and terms summary.
- Visible empty-state treatment for market filters.
- Offline-safe lifestyle visuals.
- Read-only public-company listing state.

### Changed

- Offline earnings window increased from two hours to 24 hours.
- Save timer separated from live economy timers.
- Retail cash settlement aligned with COGS, fixed expenses, and tax.
- Trading updates made functional and serialized.
- Safe-area handling moved to `react-native-safe-area-context`.
- US-market headlines replaced regionally inconsistent references.
- Business and retail spend paths now prevent negative liquid cash.
- Home screen made scroll-safe for shorter displays.

### Removed

- Debug purchase fallback rewards.
- Theme products that had no implemented theme-switching behavior.
- Silent `return null` rendering in market chart and IPO modal failure paths.

## Remaining risks and unverified areas

1. **Local APK verification:** The sandbox has Java and Gradle wrapper files but no Android SDK variables or `adb`. A clean local `assembleDebug` run could not be honestly claimed. GitHub Actions must execute the Android build and embedded-bundle verification.
2. **Hardware QA:** No physical Android handset or iPad session was available for touch, notch, font-scale, and background/foreground lifecycle testing.
3. **Platform billing:** Store products are code-wired but require Play Console product configuration and a signed test build. Debug billing cannot prove production billing behavior.
4. **Notifications:** The settings surface stores the user preference, but native scheduled notifications are not implemented yet. The current build does not claim to send them.
5. **Anti-cheat:** Clock and offline calculations remain device-local. A server-backed economy would be required for competitive leaderboards or real-money-linked balances.
6. **AdMob:** Rewarded ads and consent flows remain a follow-up integration, not a completed feature in this audit.
7. **Full visual QA:** Source-level responsive safeguards were applied, but screenshot and hardware verification of every business room, market filter, modal, and settings state remains outstanding.

## Recommended next milestone

The next release candidate should be built by GitHub Actions, installed on the target Android phone, and tested through a short scripted run: launch, tap 25 times, claim the daily mission, acquire retail, order stock, wait for sales, force-close, reopen offline, trade one asset, open settings, and verify that the saved state and wallet ledger remain consistent.

## References

[1]: https://reactnative.dev/docs/asyncstorage "React Native storage guidance"
[2]: https://developer.android.com/build/building-cmdline "Android command-line build guidance"
