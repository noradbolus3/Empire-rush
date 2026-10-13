# Round 40 — Construction Company

## Baseline

- Base branch: `origin/round-39-factory-company`
- Base commit: `154ed91072f107cb0ceae644417374c43a72132d`
- Working branch: `round-40-construction-company`
- Existing Bank, Taxi, Shipping, Factory, Markets, Lifestyle, and Business flows were preserved except for the Construction route/economics integration.

## Delivered

- Dedicated `ConstructionCompanyScreen` with Dashboard, Land & Projects, Machinery, Management, Contracts, and Expansion tabs.
- Four net-worth growth stages: Small contractor, Growing company, Large company, Enterprise.
- Residential, Commercial, and Industrial project choices.
- Land purchase and capacity tracking.
- Excavator, crane, mixer, and dump-truck inventory.
- Project budgets, delivery timers, crane efficiency, progress phases, completion payouts, and project count.
- Private and Government contract catalog with deadlines and reputation rewards.
- Construction asset valuation included in `calculateNetWorth`.
- Construction settlement path no longer uses the previous `250000/hr` hardcode; it derives hourly profit from equipment throughput, active project run-rate, contract run-rate, and labor cost.
- Five original local WebP visuals used by the Construction screen.
- Offline JS bundle regenerated.

## Deterministic proof

`npx -y tsx scripts/round40-construction-proof.ts`

Result: `PASS`, 6 scenarios.

- Stage thresholds: `$0`, `$100K`, `$500K`, `$2.5M`
- Catalog: 4 projects, 4 contracts, including Government and Private
- Example asset value: `$695,000`
- Example hourly Construction profit: `$11,939/hr`
- Example project + contract completion cash delta: `$103,000`
- Partial project progress: `1.7 seconds` remaining after a 1-second tick with a crane

## Validation

- Construction-specific TypeScript source errors: none.
- Full repository `tsc` remains blocked by four pre-existing Round 39 proof-script type errors in `scripts/round34-loan-repair-proof.ts` and `scripts/round36-1a-business-level-proof.ts`; those unrelated proof scripts were not changed in Round 40.
- Offline bundle generated successfully: `android/app/src/main/assets/index.android.bundle`.
- Local Gradle build was not run because this sandbox does not have a usable Android SDK; GitHub Actions is the configured Android build environment.

## Assets

All five Construction visuals are local WebP files at 1280×720:

- dashboard: 175,314 bytes
- land: 221,934 bytes
- machinery: 177,668 bytes
- project: 174,370 bytes
- contracts: 282,092 bytes
