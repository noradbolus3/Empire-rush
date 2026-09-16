# Empire Rush

Empire Rush is a React Native business tycoon simulator built with Expo and designed to compile into a standalone Android APK through Gradle.

## 2026 fintech simulator systems

The mobile client uses an ultra-deep obsidian, emerald, cyan, crimson, and titanium-slate design system. The current production scope is Module 1: a safe-area protected titanium VIZA card, USD balance, capped clicker upgrades, animated haptic tap feedback, and a fully accounted Retail Shop.

The exchange simulates eight fictional equities and six crypto assets with one-second oscillating prices, volatility, live SVG area charts, 1D/1W/1M range controls, breaking market news, buy/sell execution, average entry price, realized P&L, and unrealized P&L percentages. The business ecosystem covers Coffee Kiosk, E-Commerce Drop-shipping, Local Taxi, Cloud Kitchen Chain, Logistics Fleet, Construction Agency, Private Bank, EV Factory, and Aerospace Research. Each unlocked business has revenue, rent/electricity/material/salary operating costs represented in OPEX, dynamic pricing controls, levels, and auto-restock automation toggles.

The Module 1 economy persists cash, click level, click value, Retail Shop ownership, inventory, and staff through AsyncStorage. Offline settlement is capped at two hours.

## Android build

The GitHub Actions workflow at `.github/workflows/build-android.yml` sets up Node.js and JDK 17, configures the Android SDK, installs dependencies, runs Expo prebuild, generates a production JavaScript bundle into `android/app/src/main/assets/index.android.bundle`, disables Metro-only debug variants, runs `./gradlew clean && ./gradlew assembleDebug`, verifies the bundle is inside the APK, and uploads `app-debug.apk` through `actions/upload-artifact@v4`.

Local validation commands:

```bash
npm ci
npx tsc --noEmit
npx react-native bundle --platform android --dev false --entry-file index.js \
  --bundle-output /tmp/index.android.bundle
```

The previous browser prototype remains under `legacy-web/` for reference only. New production features belong in the Expo app.


## Foundation modules

The app now includes the typed Retail Shop model under `src/types/retail.ts`, USD formatting in `src/utils/formatCurrency.ts`, safe-area Home and Business screens, AsyncStorage persistence, exact inventory/COGS/rent/payroll accounting, and the standalone Android bundle pipeline.
