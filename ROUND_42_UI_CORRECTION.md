# Empire Rush — Round 42 UI Correction

## Scope

This follow-up fixes actual component-level contrast defects reported after the first Round 42 theme pass. No new business module was added and no gameplay, save/load, market, transaction or financial formula was changed.

## Corrected files

- `App.tsx`
  - Standardized bottom navigation surface and selected state through shared tokens.
  - Fixed the active Markets route's selected filter and SELL button contrast.
- `src/components/WealthCard.tsx`
  - Forced high-contrast white Founder Command Deck title, balance labels and card metadata on dark tiers.
- `src/screens/BusinessScreen.tsx`
  - Removed whole-card opacity from locked opportunities.
  - Added neutral light-grey locked surface and readable border.
  - Changed locked-card descriptions to the shared readable muted token.
- `src/screens/MarketScreen.tsx`
  - Updated legacy responsive market palette to the shared light palette.
  - Changed SELL button to a light red surface with red border/text.
- `src/screens/markets/MarketsModuleScreen.tsx`
  - Fixed detail SELL button foreground/background contrast.
  - Added a bordered light disclaimer/detail note.
  - Routed muted text through shared readable tokens.

## Verification

- `npx tsc --noEmit`: PASS
- `npm run test:render`: PASS (existing React test-renderer and act-environment warnings only)
- `scripts/wallet-guard-proof.ts`: PASS
- `scripts/round32a-financial-core-proof.ts`: PASS
- `scripts/collection-audit.ts`: PASS
- `scripts/holding-proof.ts`: PASS
- `git diff --check`: PASS
- Physical Android screenshots at the supplied device dimensions: NOT TESTED in this sandbox

The Android build must be generated from this correction commit before an APK can be called current. The previous APK is from commit `c7a11f3ddf41dc04e60ec823cb35248059df3a36` and must not be presented as proof of these follow-up fixes.
