# BUILDBOSS — PHASE 1 AUDIT EVIDENCE REPORT

## 1. Repository and branch integrity
- **Branch:** `jules-1368294426935660111-ce53a8e9`
- **HEAD Commit SHA:** `919bf7e8950201e50c48aaaf8f7bdacb479f28f1`
- **Working Tree:** Clean. No uncommitted changes.
- **Main Branch:** Unmodified.

## 2. Complete business inventory
The application consists of 11 core generic base businesses in `DEFAULT_BUSINESSES` and 13 separate "specialized" business states in `GameContext`.

**Base Businesses (11 in `src/engine/businessSimulation.ts`)**:
1. Retail: `apex-retail` (Copper & Bloom Market) - Unlocked, Playable
2. Mobility: `metro-mobility` (Neon Mile Fleet) - $15K NW, Playable
3. Tech_SaaS: `cyberpulse-saas` (IT & Software Company) - $75K NW, Playable
4. Construction_Mega: `titan-infrastructure` (Construction Company) - $250K NW, Playable
5. Banking: `blueharbor-banking` (Banking Company) - $1.5M NW, Playable
6. Real_Estate: `harbor-estates` (Harborlight Properties) - $750K NW, Not Verified / Missing deep mechanics
7. Energy: `brightgrid-energy` (Sunward Gridworks) - $2.5M NW, Missing deep mechanics
8. Pharma: `northstar-pharma` (Northstar Therapeutics) - $8M NW, Missing deep mechanics
9. Media: `signal-media` (Signal & Story Studios) - $25M NW, Missing deep mechanics
10. Sports: `summit-sports` (Fastbreak Atlas) - $80M NW, Missing deep mechanics
11. Airline: `atlas-air` (BlueArc Air) - $250M NW, Missing deep mechanics

**Specialized Company States (13 in `src/context/GameContext.tsx`)**:
1. `taxiCompany` (id: `empire-taxi-company`, `TaxiCompanyState`)
2. `shippingCompany` (id: `empire-shipping-company`, `ShippingCompanyState`)
3. `factoryCompany` (id: `empire-factory-company`, `FactoryCompanyState`)
4. `constructionCompany` (id: `empire-construction-company`, `ConstructionCompanyState`)
5. `dealership` (id: `empire-car-dealership`, `DealershipState`)
6. `softwareCompany` (id: `empire-software-company`, `SoftwareCompanyState`)
7. `sportsClub` (id: `sports-club-company`, `SportsClubState`)
8. `oilGas` (id: `oil-gas-company`, `OilGasState`)
9. `airline` (id: `airline-company`, `AirlineState`)
10. `hotel` (id: `hotel-company`, `HotelState`)
11. `blockchain` (id: `blockchain-company`, `BlockchainState`)
12. `space` (id: `space-company`, `SpaceState`)
13. `holding` (id: `holding-company`, `HoldingState`)

**Actual Total**: 24. While thematic overlap exists (e.g. `metro-mobility` and `taxiCompany`), they are distinctly modeled states.

## 3. Base vs specialized ownership architecture
Ownership is determined via two conflicting methods:
- Base businesses: `business.isAcquired === true`
- Specialized businesses: Status/non-null checks (e.g., `taxiCompany?.status === "operating"`)
There is **no single canonical selector** handling all 24 entities.

## 4. Home screen ownership findings
The `HomeScreen` (`src/screens/HomeScreen.tsx`) **lacks any state display** for active businesses or opportunities. While `BusinessScreen.tsx` calculates `activeCount = businesses.filter((item) => item.isAcquired).length` (which incorrectly skips specialized entities), `HomeScreen` simply does not read or display an ownership count at all, despite its copy reading "Every business makes your taps less important."

## 5. Financial integrity and settlement audit
- **`buildIncomeSources()`** (`src/engine/incomeLedger.ts`):
  - **Reads:** Base businesses via `businesses.filter(item => item.isAcquired)`.
  - **Reads:** Specifically `taxiCompany` via `if (taxiCompany?.status === 'operating')`.
  - **Fails to Read:** All other 12 specialized companies (shipping, factory, construction, dealership, software, sports, oil, airline, hotel, blockchain, space, holding). Their income is effectively invisible on the ledger.
- **`settleHour()`** (`src/engine/financialCore.ts`):
  - **Calculates:** `businessRevenue` which includes `businesses` and `taxiCompany`.
  - **Fails to Calculate:** All other 12 specialized companies. Those 12 entities generate zero actual liquid cash settlement in this pipeline.
- Assets: Asset valuation (`constructionAssetValue`, `itCompanyAssetValue`) handles some specialized companies, but revenue generation skips them.

## 6. Save/load reliability audit
- Orchestrated in `src/context/GameContext.tsx` via `Promise.all` across 14 independent `AsyncStorage` keys.
- **Risk (Silent Drop)**: The `.then()` block hydrates states sequentially inside `try/catch`. If a specialized company's JSON parse throws an exception, it `catch`es and immediately `set<Company>(null)`. The next time `useEffect` saves, the game overwrites the corrupted JSON string with an empty/default save, wiping that specific business's progress while preserving liquid cash.
- **Independence**: Save operations are completely un-atomic.

## 7. Business workflow depth matrix

| Business | Screens | Operations | Employees | Managers | Revenue | Expenses | Contracts | Assets | Upgrades | Events | Save/Load |
|----------|---------|------------|-----------|----------|---------|----------|-----------|--------|----------|--------|-----------|
| **Base 11** |
| Retail | WORKING | WORKING | PARTIAL | UI ONLY | WORKING | WORKING | MISSING | MISSING | WORKING | MISSING | WORKING |
| Mobility | WORKING | PARTIAL | MISSING | MISSING | WORKING | MISSING | MISSING | MISSING | WORKING | MISSING | WORKING |
| Tech_SaaS | WORKING | PARTIAL | MISSING | MISSING | WORKING | MISSING | MISSING | MISSING | WORKING | MISSING | WORKING |
| Const_Mega | WORKING | PARTIAL | MISSING | MISSING | WORKING | MISSING | MISSING | MISSING | WORKING | MISSING | WORKING |
| Banking | WORKING | PARTIAL | MISSING | MISSING | WORKING | MISSING | MISSING | MISSING | WORKING | MISSING | WORKING |
| Real_Estate| UI ONLY | UI ONLY | MISSING | MISSING | UI ONLY | MISSING | MISSING | MISSING | UI ONLY | MISSING | WORKING |
| Energy | UI ONLY | UI ONLY | MISSING | MISSING | UI ONLY | MISSING | MISSING | MISSING | UI ONLY | MISSING | WORKING |
| Pharma | UI ONLY | UI ONLY | MISSING | MISSING | UI ONLY | MISSING | MISSING | MISSING | UI ONLY | MISSING | WORKING |
| Media | UI ONLY | UI ONLY | MISSING | MISSING | UI ONLY | MISSING | MISSING | MISSING | UI ONLY | MISSING | WORKING |
| Sports | UI ONLY | UI ONLY | MISSING | MISSING | UI ONLY | MISSING | MISSING | MISSING | UI ONLY | MISSING | WORKING |
| Airline | UI ONLY | UI ONLY | MISSING | MISSING | UI ONLY | MISSING | MISSING | MISSING | UI ONLY | MISSING | WORKING |
| **Specialized**|
| taxiCompany | WORKING | WORKING | WORKING | WORKING | WORKING | WORKING | MISSING | WORKING | WORKING | WORKING | WORKING |
| shippingCo. | WORKING | WORKING | WORKING | MISSING | MISSING | MISSING | WORKING | WORKING | WORKING | MISSING | WORKING |
| factoryCo. | WORKING | WORKING | WORKING | MISSING | MISSING | MISSING | MISSING | WORKING | WORKING | MISSING | WORKING |
| constCompany| WORKING | WORKING | WORKING | WORKING | MISSING | MISSING | WORKING | WORKING | WORKING | MISSING | WORKING |
| dealership | WORKING | WORKING | WORKING | WORKING | MISSING | MISSING | MISSING | WORKING | WORKING | MISSING | WORKING |
| softwareCo. | WORKING | WORKING | WORKING | WORKING | MISSING | MISSING | WORKING | WORKING | WORKING | MISSING | WORKING |
| sportsClub | UI ONLY | UI ONLY | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | WORKING |
| oilGas | UI ONLY | UI ONLY | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | WORKING |
| airline | UI ONLY | UI ONLY | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | WORKING |
| hotel | UI ONLY | UI ONLY | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | WORKING |
| blockchain | UI ONLY | UI ONLY | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | WORKING |
| space | UI ONLY | UI ONLY | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | WORKING |
| holding | WORKING | WORKING | WORKING | WORKING | MISSING | MISSING | MISSING | WORKING | WORKING | WORKING | WORKING |

*Note on Specialized Revenue/Expenses: Outside of Taxi Company, these entities compute local projections but are disconnected from `financialCore.ts` `settleHour` actuals, rendering them functionally "MISSING" from real liquid gameplay.*

**Duplicate Concepts**:
- `metro-mobility` (Base) vs `taxiCompany` (Specialized)
- `titan-infrastructure` (Base) vs `constructionCompany` (Specialized)
- `cyberpulse-saas` (Base) vs `softwareCompany` (Specialized)
- `summit-sports` (Base) vs `sportsClub` (Specialized)
- `atlas-air` (Base) vs `airline` (Specialized)

## 8. Employee and manager system audit
- Generic base businesses implement a thin `{ headcount: number; morale: number; automationManagerHired: boolean }` structure.
- Specialized businesses track distinct, un-unified properties (e.g. Space has `engineers`, Hotel has `staff` and `managers`, Software has `developers`, `designers`, `qa`).

## 9. Test execution evidence

| Test Script | Command | Result | Proof | Does Not Prove | Output Sample |
|-------------|---------|--------|-------|----------------|---------------|
| round40-construction | `npx tsx scripts/round40-construction-proof.ts` | PASS | UI logic triggers (stage, catalog, asset value, isolated hr economics) | System settlement in `financialCore` | `{ "status": "PASS", "scenarios": [...] }` |
| buildboss-taxi | `npx tsx scripts/buildboss-taxi-proof.ts` | PASS | Taxi net calculates correctly & ledger entries generate locally | Interaction / render states | `{"ok": true, "taxi": { "net": 96 }, "settlement": {"cashDelta": 96}}` |
| holding | `npx tsx scripts/holding-proof.ts` | PASS | Holding logic calculations & guard against double counting | Core settlement integration | `{"test": "holding-proof", "status": "PASS"}` |
| sports-club | `npx tsx scripts/sports-club-proof.ts` | PASS | Isolated hourly revenue | Core settlement integration | `{"test": "sports-club-proof", "status": "PASS"}` |
| blockchain | `npx tsx scripts/blockchain-proof.ts` | PASS | Isolated hourly revenue | Core settlement integration | `{"test": "blockchain-proof", "status": "PASS"}` |
| space | `npx tsx scripts/space-proof.ts` | PASS | Isolated hourly revenue | Core settlement integration | `{"test": "space-proof", "status": "PASS"}` |
| hotel | `npx tsx scripts/hotel-proof.ts` | PASS | Isolated hourly revenue | Core settlement integration | `{"test": "hotel-proof", "status": "PASS"}` |
| airline | `npx tsx scripts/airline-proof.ts` | PASS | Isolated hourly revenue | Core settlement integration | `{"test": "airline-proof", "status": "PASS"}` |
| oil-gas | `npx tsx scripts/oil-gas-proof.ts` | PASS | Isolated hourly revenue | Core settlement integration | `{"test": "oil-gas-proof", "status": "PASS"}` |
| round38-shipping | `npx tsx scripts/round38-shipping-proof.ts` | PASS | Level growth, warehouse logic | Core settlement integration | `{"test": "round38-shipping-proof", "failed": 0}` |
| round39-factory | `npx tsx scripts/round39-factory-proof.ts` | PASS | Production, lines, isolated tick | Core settlement integration | `{"test": "round39-factory-proof...", "failed": 0}` |
| round41-dealership| `npx tsx scripts/round41-dealership-proof.ts` | PASS | Sales, inventory math | Core settlement integration | `{"test": "round41-dealership-proof", "failed": 0}` |
| round42-software | `npx tsx scripts/round42-software-proof.ts` | PASS | Delivery logic, stage unlocks | Core settlement integration | `{"test": "round42-software-proof", "failed": 0}` |
| round32a-finance | `npx tsx scripts/round32a-financial-core-proof.ts` | PASS | Base `businessRevenue`, loan and tax integration | Complete coverage | `{"scenario": "Round 32A shared financial core", "status": "PASS"}` |

## 10. Manus-to-Jules migration and branch comparison

| Feature | Branch | Commit SHA | Present in main? | Test/build evidence | Status | Risk |
|---------|--------|------------|------------------|---------------------|--------|------|
| Space Company | `origin/space-aerospace-company` | Unknown | UI/Logic exist, disconnected | Space proof script PASS | Incomplete Integration | Low (Isolated) |
| Hotel Hospitality | `origin/hotel-hospitality-company` | Unknown | UI/Logic exist, disconnected | Hotel proof script PASS | Incomplete Integration | Low (Isolated) |
| Blockchain Tech | `origin/blockchain-digital-company` | Unknown | UI/Logic exist, disconnected | Blockchain proof PASS | Incomplete Integration | Low (Isolated) |
| Holding Co. Mergers | `origin/holding-company-mergers` | Unknown | UI/Logic exist, disconnected | Holding proof PASS | Incomplete Integration | Low (Isolated) |
| Sports Club | `origin/sports-club-company` | Unknown | UI/Logic exist, disconnected | Sports Club proof PASS | Incomplete Integration | Low (Isolated) |
| Audit Fix Economy | `origin/audit-fixes-economy-boundary` | `8751dcc4...` | Partially (Taxi is fixed, 12 others broken) | Core test PASS | Incomplete Integration | High (Core Economy) |

*Note: The older branch hashes requested (like `1078c021fb7649aa3ed9386ef48787601784e56e`) return fatal git lookup failures.*

## 11. Verified bugs vs potential risks vs missing features
- **Bug (Critical):** `settleHour` exclusively incorporates `taxiCompany` and base `businesses`, ignoring the operations of 12 other specialized companies. Player investments into Factory, Software, Dealership, etc., generate zero actual cash flow.
- **Bug (High):** `buildIncomeSources` excludes the 12 non-Taxi specialized companies from the UI Ledger, leading to mismatched UI vs DB state even if they were settling.
- **Risk (Architectural):** Extremely fractured AsyncStorage key structure forces sequential deserialization with high vulnerability to silent default replacements upon exception.
- **Missing Feature:** `HomeScreen` simply does not output owned portfolio amounts, nor is there a unified selector available to construct one accurately.

## 12. Prioritized P0/P1/P2 roadmap
- **P0**: Wire all 12 excluded specialized companies into `buildIncomeSources()` (Ledger UI) and `businessRevenue()` (`settleHour` actuals).
- **P1**: Consolidate ownership derivation. Establish a single canonical selector to evaluate portfolio counts, and output this metric to the `HomeScreen`.
- **P2**: Review duplicate thematic industries (e.g. deprecate `titan-infrastructure` base business if `constructionCompany` specialized model replaces it, and build an explicit save migrator).

## 13. Recommended safest development baseline
Given the state of the repository, the safest development baseline is our current HEAD (`919bf7e8950201e50c48aaaf8f7bdacb479f28f1`). Integrating 12 companies into the `financialCore` inside this sandbox guarantees atomic verification of the missing revenue streams without inheriting undefined merge conflicts from disparate remote branches.

## 14. Exact files likely to change in future implementation phases
- `src/engine/incomeLedger.ts`
- `src/engine/financialCore.ts`
- `src/screens/HomeScreen.tsx`
- `src/context/GameContext.tsx`
- `src/screens/BusinessScreen.tsx`
