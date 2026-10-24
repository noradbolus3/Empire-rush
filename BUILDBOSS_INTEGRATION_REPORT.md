# BuildBoss integration report

## Implemented

- Visible app branding is now `BuildBoss`; the Expo display name changed while the slug, Android package ID, AsyncStorage keys and saved-game identifiers remain unchanged.
- Taxi Company is now part of the authoritative `FinancialGameState`. `settleHour()` calls the existing `taxiHourlyEconomics()` function and includes Taxi net operations in business revenue, projected hourly net, cash delta and the unified settlement ledger.
- The App income breakdown also uses `taxiHourlyEconomics()` and shows the operating Taxi Company as a Mobility income source. This removes the HUD/Taxi discrepancy caused by the old `businesses`-only calculation.
- Existing Taxi saves whose display name is `Empire Taxi Co.` are migrated in `GameContext` to `BuildBoss Mobility Co.` without changing the save key or state ID.
- Taxi tabs are compact horizontal-scroll controls rather than wrapped tall controls. The Taxi page has a safe, scrollable content surface with bottom-navigation clearance.
- Business content has explicit top spacing and extra bottom padding so the last card is reachable above the fixed navigation.

## Verification

- `npx tsc --noEmit`: PASS
- `npm run test:render`: PASS (React test-renderer emits existing deprecation/act warnings)
- `npx tsx scripts/buildboss-taxi-proof.ts`: PASS; 1 economy taxi + 1 driver = $126 revenue, $30 expenses, $96 net; unified settlement reports $96 business revenue and $96 projected hourly net.
- `npx tsx scripts/wallet-guard-proof.ts`: PASS
- `npx tsx scripts/round32a-financial-core-proof.ts`: PASS
- `npx tsx scripts/holding-proof.ts`: PASS
- `npx tsx scripts/collection-audit.ts`: PASS
- `git diff --check`: PASS

The repository's existing `scripts/regression-health.ts` currently fails its own stale assertion `bank: bottom navigation route missing`; this is reported rather than masked. It is not caused by the Taxi/economy patch.

## Device status

A real Android device/emulator was not available in this sandbox. Visual acceptance on a physical phone remains NOT DEVICE-VERIFIED. The Android APK build must be completed in GitHub Actions before a download can be claimed.
