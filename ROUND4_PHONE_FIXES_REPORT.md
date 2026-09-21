# Empire Rush Round 4 Phone-Fix Report

**Protected baseline:** `stable-round-3` at `6fe9ac3`

**Working branch:** `round-4-phone-fixes`

**Feature commit:** `1def20f` (`Fix Round 4 phone UI and progression gates`)

**Bundle commit:** `f425234` (`Bundle Round 4 phone fixes`)

**Android workflow:** [GitHub Actions run 35581151553](https://github.com/noradbolus3/Empire-rush/actions/runs/35581151553)

## Verification summary

The protected regression matrix passed before the changes and again after the changes. TypeScript validation, diff validation, offline bundle generation, clean Gradle assembly, embedded JavaScript bundle verification, and APK upload all passed in CI. The generated APK is available separately in the stable delivery folder.

The sandbox had no connected Android device or emulator (`adb` and `emulator` were unavailable). Therefore, this report does **not** claim fabricated phone screenshots. The implementation and bundle/CI evidence are verified; physical screenshot proof remains **partial** until the APK is installed on a device and screenshots are captured.

## Item-by-item status

| Requested item | Status | Implementation proof | Screenshot proof |
|---|---|---|---|
| Tap upgrade cost and ROI curve | **Fixed** | `src/engine/tapUpgradeEngine.ts` now uses `cost = round(32 × 1.4^level)` and `gain = min(10 − currentValue, 0.5 × 1.08^level)`. At level 17, the next gain is **$1.85**, not $0.50. Home displays `UPGRADE LEVEL … · +$1.85 NEXT`. The regression gate asserts level 17 gain is greater than $0.50. | **Partial**: verified in source, bundle, and regression; no physical device screenshot was possible in this sandbox. |
| Lifestyle icons: car, jet, yacht, penthouse | **Fixed** | `LifestyleVisual` now receives the complete lifestyle item and selects a dedicated SVG icon by item category: car body and wheels, aircraft fuselage and wings, yacht hull and sail, or penthouse facade. Supercars can no longer fall through to the yacht path. | **Partial**: icon paths are in the generated bundle; no connected-device screenshot was available. |
| Upkeep row/button spacing | **Fixed** | The lifestyle `upkeepRow` now has larger horizontal spacing plus bottom margin, and the acquire button has a dedicated top margin. | **Partial**: layout styles are bundled and typechecked; physical screenshot unavailable. |
| US-style stock names / BrightGrid rename | **Fixed** | Current seed is `SunPeak Energy`, `Vantage Motors`, and `Beacon Bank` in `App.tsx`. The legacy business entry is also `SunPeak Energy` in `src/engine/businessSimulation.ts`. Persisted old names are normalized during hydration: `BrightGrid Energy → SunPeak Energy`, `Surya Energy → SunPeak Energy`, `Vahana Motors → Vantage Motors`, `Bharat Bank → Beacon Bank`. The previous BrightGrid screenshot was from an older installed build, not the new Round 4 APK. | **Partial**: source and bundle proof available; no device screenshot available. |
| Business `1 ACTIVE` badge clipping | **Fixed** | `BusinessScreen.tsx` constrains the hero title with a flexible container and gives the badge `flexShrink: 0`, reduced width, and an explicit layout gap. The badge can no longer be pushed beyond the right edge by the title. | **Partial**: layout code and CI bundle verified; no device screenshot available. |
| Empty gap below business header | **Fixed** | Business content top padding is reduced to 8px and hero minimum height is reduced from 214px to 198px, keeping the first goal card closer to the header without collapsing safe-area content. | **Partial**: layout code and CI bundle verified; no device screenshot available. |
| Rebirth locked before net-worth gate | **Fixed** | Home now renders a disabled `REBIRTH LOCKED · NEED $X` button while net worth is below $1,000,000. The existing confirmation/reward preview remains available only after the gate. | **Partial**: source, regression marker, and bundle verified; no physical screenshot available. |
| IPO locked before net-worth gate | **Fixed** | Business operations show a locked IPO card with `Need $X more net worth` below the shared `$500,000` IPO gate. The public-offering card/action is shown only after the gate or for an existing public listing. | **Partial**: source, regression marker, and bundle verified; no physical screenshot available. |
| Settings build version and commit hash | **Fixed** | `src/config/buildInfo.ts` displays `Version 1.0.0-round4` and source commit `1def20f`. Settings renders both values under **BUILD IDENTITY**. The APK bundle contains `1def20f`. | **Partial**: bundle string verified; no device screenshot available. |

## Regression and build evidence

The final local gate output was:

```text
Round 2 baseline regression matrix passed
```

The final bundle command completed successfully and verified the pinned build identity:

```text
1def20f
```

CI run `35581151553` passed all of these steps:

- Checkout
- Node.js and Java 17 setup
- Android SDK setup
- JavaScript dependency installation
- Expo native project generation
- Standalone offline bundle configuration
- Offline JavaScript bundle generation
- Clean Gradle debug APK build
- Embedded `assets/index.android.bundle` verification
- APK artifact upload

## APK

The Round 4 APK was downloaded from the successful workflow and verified locally.

- File: `empire-rush-round4-debug.apk`
- Size: approximately 252 MB
- SHA-256: `1c61441701e84e517b308f24b19e8733b02ac42f2bccff418555c7479c83e92e`

## Screenshot follow-up

To complete the remaining **physical screenshot proof**, install this exact APK, open each affected screen, and capture: Home upgrade at a high level; each lifestyle category; Business registry; Business operations IPO lock; Rebirth lock on Home; and Settings > Build Identity. The sandbox cannot access the user’s phone and had no Android emulator, so those screenshots must come from the phone or a connected emulator rather than being invented here.
