import assert from "node:assert/strict";
import { DEFAULT_BUSINESSES } from "../src/engine/businessSimulation";
import { settleHour, calculateNetWorth } from "../src/engine/financialCore";
import {
  buildCanonicalBusinessRegistry,
  canonicalActiveCount,
  canonicalProjectedHourlyNet,
} from "../src/engine/canonicalBusinessRegistry";
import { acceptIPOOnce } from "../src/engine/ipoIdempotency";
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
import type { IPOListing } from "../src/types/ipo";

const owned = <T extends Record<string, unknown>>(state: T, patch: Partial<T>) => ({ ...state, ...patch });
const generic = DEFAULT_BUSINESSES.map((business, index) =>
  index === 0
    ? { ...business, isAcquired: true, hourlyNetProfit: 125, pendingSettlementAmount: 50 }
    : business,
);
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

const registry = buildCanonicalBusinessRegistry({ businesses: generic, ...sources });
const ids = registry.map((item) => item.id);
assert.equal(new Set(ids).size, ids.length, "canonical IDs must be unique");
assert.equal(
  registry.length,
  generic.length + Object.keys(sources).length - 2,
  "Construction and Software generic shadows are replaced by their specialized authority records",
);
assert.equal(canonicalActiveCount(registry), Object.keys(sources).length + 1, "owned active count includes every owned operating source exactly once");
assert.ok(canonicalProjectedHourlyNet(registry) > 0, "specialized engines must produce real projected income");
for (const kind of ["taxi", "shipping", "factory", "construction", "dealership", "software", "sports", "oilGas", "airline", "hotel", "blockchain", "space", "holding"] as const) {
  assert.ok(registry.some((item) => item.kind === kind && item.owned), `missing owned ${kind} registry record`);
}

const bank = {
  savingsBalance: 0,
  businessCheckingBalance: 0,
  deposits: [],
  loans: [],
  insurance: [],
  investors: [],
  savingsRateBoostUntil: 0,
  taxRecords: [],
  marketEvents: [],
};
const financialState = {
  cash: 500,
  bank,
  assets: [],
  holdings: {},
  owned: [],
  lifestyleAssets: [],
  businesses: generic,
  businessRegistry: registry,
  systemTimeMs: 1_000_000,
};
const beforeWorth = calculateNetWorth(financialState);
const first = settleHour(financialState);
assert.ok(first.breakdown.businessRevenue > 0, "central settlement must include registry revenue");
assert.equal(first.state.businesses[0].pendingSettlementAmount, 0, "generic pending amount is consumed once");
const refreshed = {
  ...first.state,
  businessRegistry: buildCanonicalBusinessRegistry({
    businesses: first.state.businesses,
    ...(first.state.businessSources || sources),
  }),
};
const second = settleHour(refreshed);
assert.equal(second.state.businesses[0].pendingSettlementAmount, 0, "second settlement cannot reuse pending revenue");
assert.equal(
  first.state.businesses[0].pendingSettlementAmount,
  0,
  "first settlement clears generic pending revenue",
);
assert.equal(
  second.state.businesses[0].pendingSettlementAmount,
  0,
  "second settlement keeps generic pending revenue cleared",
);
assert.ok(calculateNetWorth(financialState) >= beforeWorth, "registry assets do not reduce net worth");

const listing = { companyId: "generic-ipo-a", stage: "public", capitalRaised: 250, ticker: "AAA" } as IPOListing;
const firstIPO = acceptIPOOnce({}, listing);
const duplicateIPO = acceptIPOOnce(firstIPO.listings, listing);
assert.equal(firstIPO.accepted, true, "first IPO is accepted");
assert.equal(duplicateIPO.accepted, false, "same company IPO is idempotent");
const secondCompany = acceptIPOOnce(firstIPO.listings, { ...listing, companyId: "generic-ipo-b", ticker: "BBB" });
assert.equal(secondCompany.accepted, true, "different company has independent IPO state");

console.log(JSON.stringify({
  records: registry.length,
  activeCount: canonicalActiveCount(registry),
  projectedHourlyNet: canonicalProjectedHourlyNet(registry),
  firstSettlementRevenue: first.breakdown.businessRevenue,
  secondSettlementRevenue: second.breakdown.businessRevenue,
  ipo: { firstAccepted: firstIPO.accepted, duplicateAccepted: duplicateIPO.accepted, secondCompanyAccepted: secondCompany.accepted },
}, null, 2));
