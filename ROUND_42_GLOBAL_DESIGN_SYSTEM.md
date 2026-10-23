# Empire Rush — Round 42 Global Design System

## Baseline

- Starting branch: `full-game-audit-fixes`
- Starting commit: `7d3fe9b2ff1fcafd5a9fa04d72fabf7a27665563`
- Working branch: `round-42-global-design-system`

## Design tokens

Centralized in `src/theme/designSystem.ts`:

- App background: `#F5F7FA`
- Cards and panels: `#FFFFFF`
- Primary green: `#087F5B`
- Headings: `#183153`
- Secondary text: `#526477`
- Highlight: `#E7F5EF`
- Borders: `#DCE3EB`
- Accessible negative: `#C62828`

## Migrated surfaces

- `App.tsx` shared shell and navigation palette
- `src/screens/HomeScreen.tsx`
- `src/screens/BusinessScreen.tsx`
- `src/screens/BusinessDetailScreen.tsx`
- `src/screens/BusinessExpansionScreen.tsx`
- `src/screens/BusinessFinancialsScreen.tsx`
- `src/screens/BusinessSupplyChainScreen.tsx`
- `src/screens/BusinessWorkforceScreen.tsx`
- `src/screens/business/RetailHubScreen.tsx`
- `src/screens/business/BusinessMasterHubScreen.tsx`
- `src/screens/markets/MarketsModuleScreen.tsx`
- `src/screens/LifestyleScreen.tsx`
- `src/screens/BankScreen.tsx`
- `src/components/ChipRow.tsx`

Colorful business imagery and stock/crypto semantic accents remain intact; the base surfaces, typography colors, controls and borders now share the same light system.

## Safety boundary

No engine, context, save/migration, settlement, market formula, purchase flow, or financial logic files were changed. Existing screen navigation and state callbacks are preserved.

## Verification

- TypeScript: PASS (`npx tsc --noEmit`)
- Render smoke: PASS (`npm run test:render`)
- Wallet regression proof: PASS
- Shared financial core proof: PASS
- Collection audit: PASS
- Holding proof: PASS
- Device screenshots: NOT TESTED in this sandbox; CI/render evidence is not physical-device evidence.
- Android build: pending final dispatch from this branch.
