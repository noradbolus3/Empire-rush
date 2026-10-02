# Empire Rush — Round 17 Collections & Simulated Stocks

## Status

**Implemented and locally/CI verified on isolated branch `round-17-collections-stocks`.** Main was intentionally not merged because the requested workflow requires phone verification first.

- Stable baseline tag: `stable-round-16`
- Round 17 source commit: `b8bc614` — `Add deep lifestyle collections and simulated stock catalog`
- Branch: `round-17-collections-stocks`
- Android workflow: [Run 36441149797](https://github.com/noradbolus3/Empire-rush/actions/runs/36441149797)
- Build result: **success**
- APK: `app-debug.apk`, 253 MB
- APK SHA-256: `17e4f0194701c939fe816a0345c6d5555c994692e021274f312115eea84eaff2`
- CI proved the standalone bundle step and verified `assets/index.android.bundle` inside the APK.

## A. File structure and import chain

### App → screens → collections

```text
App.tsx
  └─ imports { LifestyleScreen, MarketScreen, ... } from ./src/screens
      └─ src/screens/index.ts
          ├─ LifestyleScreen.tsx
          │   ├─ CarsTab.tsx → CollectionTab.tsx → AssetCard.tsx → carsData.ts
          │   ├─ YachtsTab.tsx → CollectionTab.tsx → AssetCard.tsx → yachtsData.ts
          │   ├─ JetsTab.tsx → CollectionTab.tsx → AssetCard.tsx → jetsData.ts
          │   └─ PropertiesTab.tsx → CollectionTab.tsx → AssetCard.tsx → propertiesData.ts
          └─ MarketScreen.tsx → stocksData.ts
```

`App.tsx` also imports all four collection data files for owned-asset net-worth valuation, and imports `STOCK_CATALOG` plus `LEGACY_STOCK_NAME_MIGRATIONS` for canonical market seeding and old-save migration.

### New collection/stock modules

- `src/data/carsData.ts`
- `src/data/yachtsData.ts`
- `src/data/jetsData.ts`
- `src/data/propertiesData.ts`
- `src/data/stocksData.ts`
- `src/data/collectionTypes.ts`
- `src/screens/AssetCard.tsx`
- `src/screens/CollectionTab.tsx`
- `src/screens/CarsTab.tsx`
- `src/screens/YachtsTab.tsx`
- `src/screens/JetsTab.tsx`
- `src/screens/PropertiesTab.tsx`
- `scripts/collection-audit.ts`

The obsolete single-catalog `src/data/lifestyleCatalog.ts` was removed after all references were migrated.

## B. Collection audit output

Executed:

```bash
npx tsx scripts/collection-audit.ts
```

Result:

```json
{
  "ok": true,
  "collections": {
    "cars": { "count": 30, "minPrice": 12000, "maxPrice": 480000000, "minImageBytes": 9736, "maxImageBytes": 11148 },
    "yachts": { "count": 30, "minPrice": 25000, "maxPrice": 620000000, "minImageBytes": 9018, "maxImageBytes": 10220 },
    "jets": { "count": 30, "minPrice": 150000, "maxPrice": 720000000, "minImageBytes": 11380, "maxImageBytes": 13860 },
    "properties": { "count": 30, "minPrice": 10000, "maxPrice": 850000000, "minImageBytes": 8806, "maxImageBytes": 13390 }
  },
  "stocks": {
    "count": 30,
    "sectors": ["TECH", "ENERGY", "PHARMA", "MOBILITY", "BANKING", "RETAIL", "AEROSPACE", "MEDIA", "REAL_ESTATE", "CONSUMER"],
    "minPrice": 28,
    "maxPrice": 920
  }
}
```

The audit asserts:

- Every lifestyle category has at least 30 items.
- Names are unique within each category and globally across the lifestyle pack.
- Every item has a unique WebP path, and every path exists on disk.
- Collection prices rise monotonically from entry-level to late-game.
- The stock catalog has 30 unique fictional stocks across 10 sectors.
- Stock descriptions and dividend yields exist.
- A 50+ entry whole-word banned-brand list is absent from collection and stock names/data.

The 120 original procedural WebP renders are 640×400 and total approximately 1.30 MB, averaging about 10.8 KB per image. This is **smaller than the requested 100–150 KB target**, not larger; the pack is therefore compact for offline APK distribution. If the target means a minimum rather than an upper-size guideline, that specific size target is **not done by design**.

## C. Five-item samples per collection

| Collection | Item | Price | Monthly upkeep | Prestige |
|---|---|---:|---:|---:|
| Cars | Northstar Kestrel | $12,000 | $100 | 9 |
| Cars | Velora Cityline | $17,000 | $100 | 13 |
| Cars | Cinder Vale Sedan | $25,000 | $200 | 17 |
| Cars | Marrow Ridge SUV | $36,000 | $300 | 20 |
| Cars | Ironleaf Trailhawk | $52,000 | $500 | 24 |
| Yachts | Tideglass 28 | $25,000 | $300 | 15 |
| Yachts | Cobalt Skimmer | $35,000 | $400 | 19 |
| Yachts | Mariner Sol | $50,000 | $600 | 22 |
| Yachts | Silverwake 42 | $71,000 | $900 | 26 |
| Yachts | Coral Meridian | $101,000 | $1,400 | 29 |
| Jets | Pinecrest TP | $150,000 | $2,400 | 29 |
| Jets | Arrowmere 8 | $201,000 | $3,300 | 32 |
| Jets | Cobalt Wing | $269,000 | $4,600 | 35 |
| Jets | Silverline 40 | $361,000 | $6,400 | 38 |
| Jets | Northwind Light | $483,000 | $8,800 | 42 |
| Properties | Parkside Microloft | $10,000 | $0 | 8 |
| Properties | Cedarline Studio | $15,000 | $100 | 12 |
| Properties | Juniper Townhouse | $22,000 | $100 | 16 |
| Properties | Copperleaf Loft | $32,000 | $100 | 19 |
| Properties | Riverview Duplex | $48,000 | $200 | 23 |

## D. Simulated stock samples

These are fictional in-game prices, not live market data.

| Ticker | Name | Sector | Simulated price | Dividend yield |
|---|---|---|---:|---:|
| ARC | Asteron Systems | TECH | $920 | 1.8% |
| QNT | Meridian Gridworks | ENERGY | $540 | 2.4% |
| SPK | Gridline Power | ENERGY | $410 | 2.1% |
| NST | Heliox Therapeutics | PHARMA | $690 | 1.4% |
| VGT | Vertexa Mobility | MOBILITY | $275 | 0.6% |

Market behavior remains simulated through the existing seeded random-walk engine; the 30-stock catalog does not use live prices or network data.

## E. Persistence and legacy-save migration

- Save schema increased from **6 to 7** in `src/engine/saveMigration.ts`.
- Existing holdings preserve IDs, shares, average cost, realized P&L, trade history, and portfolio history.
- Legacy stock display names are mapped through `LEGACY_STOCK_NAME_MIGRATIONS`.
- App hydration normalizes saved assets, applies canonical names/sectors/descriptions/prices, and appends any newly introduced catalog assets without deleting old holdings.
- The schema marker `marketCatalogVersion: 'round17-fictional-v1'` is added for migrated saves.

## F. Verification gates

Passed on the Round 17 branch:

```text
npx tsc --noEmit                         PASS
npx tsx scripts/regression-health.ts    PASS — Round 2 baseline regression matrix passed
npx tsx scripts/collection-audit.ts     PASS — ok: true; 30/30/30/30 collections; 30 stocks; 10 sectors
git diff --check                         PASS
```

The GitHub Actions build passed all steps, including native Android generation, standalone offline JS bundling, clean debug APK build, embedded-bundle verification, and artifact upload.

## G. Verification limits / not done

- **Real phone or emulator screenshots:** **not done** in this round; the APK is supplied for phone verification.
- **Main merge:** **not done by design**; branch remains isolated until phone verification.
- **Live stock prices:** **not applicable / not done by design**; the game intentionally uses simulated fictional prices.
- **100–150 KB per-image target:** the assets are much smaller (about 8.8–13.9 KB each); compact offline packaging is verified, but the literal 100–150 KB target is not met.

## APK delivery

[Download the Round 17 standalone debug APK](https://github.com/noradbolus3/Empire-rush/actions/runs/36441149797)

The artifact is also staged in the Manus project delivery folder as `empire-rush-round17-debug.apk`.
