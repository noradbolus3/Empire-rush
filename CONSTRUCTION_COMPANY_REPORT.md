# Construction Company — Round 33 Scoped Implementation

## Status

- Branch: `round-33-construction-company`
- Stable base tag: `stable-round-32d`
- Base commit: `23fdf0bbcdc0c69ffc6b6b3e6146bebdd44252a1`
- Main merge: **not done**
- TypeScript: **pass** (`npx tsc --noEmit`)
- Offline Android JS bundle: **pass** (`android/app/src/main/assets/index.android.bundle`, 1,858,640 bytes)
- APK/phone screenshots: **not done yet**

## Implemented flow

The Construction Company is now a dedicated flow, routed from the existing Business hub only when the selected business has sector `Construction_Mega`:

1. **Dashboard** — operating income, cash, asset value, projects completed, land bank, crew, equipment, next-move actions.
2. **Land & Projects** — Residential / Commercial / Industrial market selection, site purchase, project budgets, payout, duration, stage gates.
3. **Machinery** — excavators, tower cranes, concrete mixers, dump trucks, persisted ownership and throughput effects.
4. **Project Management** — active project progress, deadline, committed materials budget, workers, phases, safety clearance.
5. **Contracts & Earnings** — private and government contracts with stage gates, payout, deadline, and reputation rewards.
6. **Expansion & Upgrades** — storage yard, advanced machinery, city expansion, government contracts desk.

## Growth stages

- **Small contractor** — starter residential work and limited crew.
- **Growing company** — reached at `$100,000` net worth; commercial work becomes available.
- **Large company** — reached at `$500,000` net worth; industrial projects become available.
- **Enterprise** — reached at `$2,500,000` net worth; civic and national infrastructure work becomes available.

## Financial integration

- Construction hourly profit is now derived from owned machinery, active project/contract run-rate, and worker cost.
- Project completion payout is queued through the existing business settlement amount path.
- Land and machinery are included in `calculateNetWorth()` through `constructionAssetValue()`.
- The old placeholder `$250,000/hr` construction rate was removed.
- Stocks, Crypto, Lifestyle, and Bank UI/logic were not modified.

## Deterministic proof output

```json
{
  "stages": {
    "zero": "Small contractor",
    "growing": "Growing company",
    "enterprise": "Enterprise"
  },
  "hourlyProfit": 2961,
  "assetValue": 605000,
  "completionCashDelta": 21000,
  "projectsCompleted": 1,
  "events": [
    "Proofline Construction: Cedar Courtyard Homes completed and paid."
  ]
}
```

## Files

- `src/screens/business/ConstructionCompanyScreen.tsx` — dedicated multi-page UI.
- `src/engine/constructionCompanyEngine.ts` — stage gates, projects, contracts, upgrades, progression, asset value, and project advancement.
- `src/data/constructionAssets.ts` — static local image map.
- `assets/construction/*.webp` — five generated original 3D visuals.
- `scripts/construction-proof.ts` — deterministic mechanics proof.
- `src/types/business.ts` — persisted Construction state fields.
- `src/engine/businessSimulation.ts` — replaces placeholder Construction economics and queues completion payouts.
- `src/engine/financialCore.ts` — includes Construction land/equipment in net worth.
- `src/screens/business/BusinessMasterHubScreen.tsx` — scoped route integration.

## Asset inventory

| Asset | Size |
|---|---:|
| construction-dashboard.webp | 175,314 bytes |
| construction-land.webp | 221,934 bytes |
| construction-machinery.webp | 177,668 bytes |
| construction-project.webp | 174,370 bytes |
| construction-contracts.webp | 282,092 bytes |

All are local WebP assets, resized to 1280×720 for APK efficiency.
