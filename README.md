# Empire Rush

Empire Rush is a React Native business tycoon game built with Expo. The app is designed to compile into a standard Android APK through the generated Gradle project, without a game-engine license.

## Current app

`App.tsx` contains the functional mobile game shell with a persistent in-memory player wallet, daily business income, market exchange, portfolio tracking, property marketplace, mortgage purchase option, and ledger. The bottom navigation exposes Home, Market, Portfolio, Property, and Ledger screens. The market includes eight fictional companies, sector movement, price-history bars, buy/sell actions, average-buy tracking, and unrealized P&L. Real estate includes apartments, shops, warehouses, land, and office towers with rent, maintenance, appreciation, and 20% down-payment flows.

Rewarded-video actions are represented in the UI for Emergency Funding, 2x Business Boost, and Tax Audit Shield. The next native integration step is to connect `react-native-google-mobile-ads` and replace Google test IDs before production release.

## Android build

The GitHub Actions workflow at `.github/workflows/build-android.yml` performs a real build. It checks out the repository, installs Node.js and JDK 17, configures the Android SDK, runs `npm ci`, runs `npx expo prebuild --platform android --non-interactive --no-install`, runs `./gradlew assembleDebug` inside `android`, and uploads `android/app/build/outputs/apk/debug/app-debug.apk` through `actions/upload-artifact@v4`.

Run locally with:

```bash
npm ci
npx expo prebuild --platform android --non-interactive --no-install
cd android
./gradlew assembleDebug
```

The previous browser prototype is retained under `legacy-web/` for reference only. New screens and game logic belong in the Expo app, not in that archive.
