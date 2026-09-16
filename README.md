# Empire Rush

## Implemented in this repository

This repository is a vanilla browser/3D game, not a React Native/Expo Android project. The following modules are implemented in the existing `EmpireGameState` and HUD architecture:

- `financial-markets-real-estate.js`
  - Eight fictional stocks across Tech, Energy, Pharma, Auto, and Banking.
  - Volatility-driven price ticks and event headlines such as tech regulation, pharma approvals, and energy policy.
  - Inline SVG price-history charts.
  - Buy/sell trading, average buy price, unrealized P&L, and quarterly dividend payouts.
  - Player-company IPO API gated at ₹5Cr valuation.
  - Residential, commercial, warehouse, land, and office-tower properties.
  - Rent, maintenance, appreciation, 20% down-payment mortgages, and EMI tracking.
  - Finance and Property modules wired into the existing HUD drawer and Finance tab.

- `admob-placements.js`
  - Shared placement contract for Emergency Angel Funding, 2x Business Boost, Tax Audit Shield, and milestone-only interstitials.
  - Uses Google's official test ad IDs; replace them in the future native shell before release.

- `.github/workflows/build-android.yml`
  - Guarded workflow for debug APK and release AAB builds once an `android/` Gradle project exists.
  - Targets Android SDK 34 and expects keystore values through GitHub Actions secrets.

## Native Android boundary

There is no `package.json`, `android/`, Gradle wrapper, React Native app, or Expo app in the current repository. Therefore this change does not claim to produce a production Android APK/AAB or install `react-native-google-mobile-ads`. The gameplay is complete in the current browser architecture, while the workflow and AdMob contract provide the handoff boundary for a future React Native/Expo port.
