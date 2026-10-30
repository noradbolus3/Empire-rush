import assert from "node:assert/strict";
import { DEFAULT_BUSINESSES } from "../src/engine/businessSimulation";
import { settleHour, type FinancialGameState } from "../src/engine/financialCore";
import {
  buildCanonicalBusinessRegistry,
  canonicalActiveCount,
  canonicalProjectedHourlyNet,
} from "../src/engine/canonicalBusinessRegistry";
import { DEFAULT_TAXI_COMPANY } from "../src/types/taxi";
import { DEFAULT_SHIPPING_COMPANY } from "../src/types/shipping";
import { DEFAULT_FACTORY_COMPANY } from "../src/types/factory";
import { DEFAULT_CONSTRUCTION_COMPANY } from "../src/types/construction";
import { DEFAULT_DEALERSHIP } from "../src/types/dealership";
import { DEFAULT_SOFTWARE_COMPANY } from "../src/types/software";
import { DEFAULT_SPORTS_CLUB } from "../src/types/sportsClub";
import { DEFAULT_OIL_GAS } from "../src/types/oilGas";
import { DEFAULT_AIRLINE } from "../src/types/airline";
import { DEFAULT_HOTEL } from "../src/types/hotel";
import { DEFAULT_BLOCKCHAIN } from "../src/types/blockchain";
import { DEFAULT_SPACE } from "../src/types/space";
import { DEFAULT_HOLDING } from "../src/types/holding";

const owned = <T extends Record<string, unknown>>(state: T, patch: Partial<T>) => ({ ...state, ...patch });
const businesses = DEFAULT_BUSINESSES.map((item, index) => index === 0
  ? { ...item, isAcquired: true, hourlyNetProfit: 125, pendingSettlementAmount: 50 }
  : item);
const sources = {
  taxiCompany: owned(DEFAULT_TAXI_COMPANY, { status: "operating", economyTaxis: 2, drivers: 2, cashInvested: 10_000 }),
  shippingCompany: owned(DEFAULT_SHIPPING_COMPANY, { status: "operating", vans: 2, drivers: 2, cashInvested: 20_000 }),
  factoryCompany: owned(DEFAULT_FACTORY_COMPANY, { status: "operating", machineLines: 2, rawMaterials: 1000, workers: 2, cashInvested: 30_000 }),
  constructionCompany: owned(DEFAULT_CONSTRUCTION_COMPANY, { status: "operating", landParcels: 2, activeProjects: 1, workers: 4, excavators: 1, cashInvested: 40_000 }),
  dealership: owned(DEFAULT_DEALERSHIP, { status: "operating", showroomSize: 1, inventory: 2, cashInvested: 50_000 }),
  softwareCompany: owned(DEFAULT_SOFTWARE_COMPANY, { status: "operating", offices: 1, activeProjects: 1, developers: 2, cashInvested: 60_000 }),
  sportsClub: owned(DEFAULT_SPORTS_CLUB, { cashReserve: 70_000, teams: 2 }),
  oilGas: owned(DEFAULT_OIL_GAS, { cashReserve: 80_000, fields: 1, productionBarrels: 100 }),
  airline: owned(DEFAULT_AIRLINE, { cashReserve: 90_000, aircraft: 1, seats: 90, routes: 1 }),
  hotel: owned(DEFAULT_HOTEL, { cashReserve: 100_000, properties: 1, rooms: 12, occupiedRooms: 8 }),
  blockchain: owned(DEFAULT_BLOCKCHAIN, { cashReserve: 110_000, servers: 1, clients: 2 }),
  space: owned(DEFAULT_SPACE, { cashReserve: 120_000, launches: 1, satellites: 2 }),
  holding: owned(DEFAULT_HOLDING, { cashReserve: 130_000, hqLevel: 1 }),
};
const registry = buildCanonicalBusinessRegistry({ businesses, ...sources });
assert.equal(new Set(registry.map((item) => item.id)).size, registry.length, "canonical IDs must be unique");
assert.equal(registry.length, businesses.length + Object.keys(sources).length - 2, "specialized Construction and Software replace generic shadows");
assert.equal(canonicalActiveCount(registry), Object.keys(sources).length + 1, "all owned active records counted once");
assert.ok(canonicalProjectedHourlyNet(registry) > 0, "specialized engines must produce projected income");
for (const kind of ["taxi", "shipping", "factory", "construction", "dealership", "software", "sports", "oilGas", "airline", "hotel", "blockchain", "space", "holding"] as const)
  assert.ok(registry.some((item) => item.kind === kind && item.owned), `missing owned ${kind}`);

const bank = { savingsBalance: 0, businessCheckingBalance: 0, deposits: [], loans: [], insurance: [], investors: [], savingsRateBoostUntil: 0, taxRecords: [], marketEvents: [] };
let cursor: FinancialGameState = { cash: 0, bank, assets: [], holdings: {}, owned: [], lifestyleAssets: [], businesses, businessRegistry: buildCanonicalBusinessRegistry({ businesses }), systemTimeMs: 1_000_000 };
const revenue: number[] = [];
let totalDelta = 0;
for (let hour = 0; hour < 2; hour += 1) {
  const result = settleHour(cursor);
  revenue.push(result.breakdown.businessRevenue);
  totalDelta += result.cashDelta;
  cursor = { ...cursor, ...result.state, bank: { ...cursor.bank, ...result.state.bank }, cash: cursor.cash + result.cashDelta, systemTimeMs: cursor.systemTimeMs + 3_600_000 };
}
assert.equal(cursor.businesses[0].pendingSettlementAmount, 0, "pending amount is cleared");
assert.equal(revenue[0], 50, "first hour consumes pending amount");
assert.equal(revenue[1], 125, "second hour uses normal generic revenue after pending amount is consumed");
assert.equal(totalDelta, Number((revenue[0] + revenue[1]).toFixed(2)), "cash delta reconciles to settlement revenue with no expenses in fixture");
console.log(JSON.stringify({ test: "canonical-business-registry-proof", status: "PASS", records: registry.length, activeCount: canonicalActiveCount(registry), projectedHourlyNet: canonicalProjectedHourlyNet(registry), revenue, totalDelta }, null, 2));
