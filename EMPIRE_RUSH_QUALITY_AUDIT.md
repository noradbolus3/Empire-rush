# Empire Rush — Quality & Integration Audit

Audit baseline: `holding-company-mergers` at `fb64fcd64ba6c8cbf0f06f15bdf6004cd4c82cd6`

Controlled follow-up branch: `full-game-audit-fixes`

## Scope

This audit covers the current React Native/Expo application, not the legacy web directory. It checks repository topology, navigation, shared state, persistence, deterministic engines, bundled assets, render smoke, TypeScript, and known economy/layout risk patterns.

## Current architecture inventory

- Root shell and tab routing: `App.tsx`
- Shared persistence and company state: `src/context/GameContext.tsx`
- Core economy: `src/engine/financialCore.ts`, `settlementEngine.ts`, `incomeLedger.ts`
- Business simulation: `src/engine/businessEngine.ts`, `businessSimulation.ts`, `businessLevels.ts`
- Markets and trading: `src/engine/marketEngine.ts`, `portfolioEngine.ts`, `tradeEngine.ts`, `marketEventEngine.ts`
- Banking: `src/engine/bankEngine.ts`, `src/screens/BankScreen.tsx`
- Lifestyle collections: `src/data/*Data.ts`, `src/screens/LifestyleScreen.tsx` and tab components
- Specialized businesses: Taxi, Shipping, Factory, Construction, Dealership, Software, Sports, Oil & Gas, Airline, Hotel, Blockchain, Space, Holding
- Holding layer: `src/types/holding.ts`, `src/engine/holdingEngine.ts`, `src/screens/HoldingCompanyScreen.tsx`

## Evidence status

### Fixed in this audit milestone

- React Native app TypeScript gate: PASS after replacing unsupported `StyleSheet.absoluteFillObject` with `StyleSheet.absoluteFill` in `src/screens/BankScreen.tsx`.
- `tsconfig.json` now scopes the app compile to application source and excludes runtime proof scripts and `legacy-web`.
- Render smoke: PASS — 29 render cases, 0 failures.
- Interaction smoke: PASS — 45 interaction cases, 0 failures.
- `git diff --check`: PASS.

### Confirmed and still open

- Markets module uses a dark palette (`#05080D`, `#09131A`, etc.) while the requested target standard is white-theme consistency. This is a real source-level mismatch, not a screenshot assumption.
- Home, Business, Lifestyle and several shared modals still use the dark green command-deck palette. Banking and specialized company screens use white surfaces. A single visual system has not yet been enforced across all modules.
- Several purchase paths perform a cash pre-check and then call a functional cash setter without a transaction lock. Rapid duplicate taps need a focused atomic-spend test and fix before being called safe. Known paths include `BusinessDetailScreen.tsx` and `CarDealershipScreen.tsx`; other specialized screens require the same review.
- `GameContext` has per-module JSON parse guards, but malformed saves generally fall back to `null` for specialized companies. This avoids a crash but needs explicit migration/preservation tests for every module before being called progress-safe.
- Holding synchronization and double-counting guard currently pass deterministic proof, but device QA is not complete.

### Historical or stale proof files

The repository contains many historical round proofs. Some assert old tab counts or old source formatting and fail against the newer implementation even when current proofs pass. These failures are not treated as current feature failures without reproduction, but they must be labeled or retired rather than used as a green regression gate.

Examples observed:

- Round 24/26 layout proofs expect old MarketScreen source patterns.
- Round 27 expects an old market tab count.
- Round 28 expects old HUD spacing.
- Round 29/30 expect old Bank route/tab contracts.
- Round 31 underwriting expectation conflicts with current zero-income starter-loan behavior.
- Round 33 proof uses an older bank settlement fixture.

### Not tested / not claimed

- Physical Android phone QA: NOT TESTED in this audit.
- Post-scroll screenshots from a real device: NOT TESTED.
- A fresh APK from `full-game-audit-fixes`: NOT BUILT yet.
- iPad workflow: NOT TESTED.
- Android offline bundle on the device: prior Holding build verified by CI, but not reverified for this audit branch.
- Dependency security remediation: NOT DONE. `npm ci --ignore-scripts` reports 36 advisories (3 moderate, 32 high, 1 critical). No forced upgrade was performed because it could alter the Expo/RN lockfile.

## Regression evidence that currently passes

- Holding proof: PASS
- Space proof: PASS
- Blockchain proof: PASS
- Hotel proof: PASS
- Airline proof: PASS
- Oil & Gas proof: PASS
- Sports Club proof: PASS
- Banking white-theme proof: PASS
- Business Registry banking entry proof: PASS
- Shared financial core Round 32A: PASS
- Round 32B bank proof: PASS
- Round 32C bank/markets proof: PASS
- Round 32D six-scenario proof: PASS
- Round 34 loan repair proof: PASS
- Round 35A foundation proof: PASS
- Round 36 business-level proof: PASS
- Round 37 Taxi proof: PASS
- Round 38 Shipping proof: PASS
- Round 39 Factory proof: PASS
- Round 40 Construction UI proof: PASS; device screenshot explicitly NOT RUN
- Round 41 Dealership proof: PASS
- Round 42 Software proof: PASS
- Collection audit: PASS — 30 cars, 30 yachts, 30 jets, 30 properties, 31 stocks, 14 crypto assets

## Next controlled milestone

1. Add atomic, locked cash-spend coverage for all purchase/upgrade flows.
2. Add malformed-save and legacy-save migration scenarios for each specialized company.
3. Normalize shared layout and white-theme tokens without deleting unrelated modules.
4. Re-run current proofs plus new P0 tests.
5. Build a fresh standalone APK and only then schedule device verification.
