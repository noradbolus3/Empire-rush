import assert from "node:assert/strict";
import { DEFAULT_BUSINESSES } from "../src/engine/businessSimulation";
import {
  buildCanonicalBusinessRegistry,
  canonicalActiveCount,
  canonicalAssetValue,
  canonicalProjectedHourlyNet,
} from "../src/engine/canonicalBusinessRegistry";
import { BUSINESS_ROUTE_CATALOG } from "../src/screens/business/businessRouteCatalog";
import {
  BUSINESS_DISPLAY_CATALOG,
  getBusinessDisplayMeta,
} from "../src/data/businessDisplayCatalog";
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
const generic = DEFAULT_BUSINESSES.map((business, index) =>
  index === 0 ? { ...business, isAcquired: true } : business,
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
const ownedRows = registry.filter((record) => record.owned);
const specializedKinds = BUSINESS_ROUTE_CATALOG.filter((route) => route.supportsDirectLaunch).map((route) => route.kind);

assert.equal(BUSINESS_DISPLAY_CATALOG.length, BUSINESS_ROUTE_CATALOG.length, "every route needs display metadata");
assert.equal(new Set(BUSINESS_DISPLAY_CATALOG.map((entry) => entry.kind)).size, BUSINESS_DISPLAY_CATALOG.length, "display kinds must be unique");
assert.equal(new Set(registry.map((record) => record.id)).size, registry.length, "canonical portfolio IDs must be unique");
assert.equal(canonicalActiveCount(registry), ownedRows.length, "active count must equal owned operating records in this fixture");
assert.ok(canonicalProjectedHourlyNet(registry) > 0, "owned portfolio must expose real projected net income");
assert.ok(canonicalAssetValue(registry) > 0, "owned portfolio must expose real asset value");
for (const kind of specializedKinds) {
  const record = registry.find((item) => item.kind === kind);
  assert.ok(record?.owned, `owned ${kind} must appear once in the canonical portfolio`);
  const display = getBusinessDisplayMeta(kind);
  assert.ok(display.visualKey.length > 0, `${kind} must have a category visual key`);
  assert.ok(display.categoryLabel.length > 0, `${kind} must have a category label`);
}

const duplicateKinds = registry.filter((record) => record.kind === "construction" || record.kind === "software");
assert.equal(duplicateKinds.length, 2, "specialized Construction and Software records replace generic shadows");
assert.equal(duplicateKinds.every((record) => record.source === "specialized-state"), true, "specialized authority must back replaced records");
assert.equal(registry.filter((record) => record.consolidatesOtherBusinesses).length, 1, "Holding appears once as a management layer");

console.log(JSON.stringify({
  status: "PASS",
  routeCount: BUSINESS_ROUTE_CATALOG.length,
  displayMetadataCount: BUSINESS_DISPLAY_CATALOG.length,
  canonicalRecords: registry.length,
  ownedRecords: ownedRows.length,
  activeCount: canonicalActiveCount(registry),
  projectedHourlyNet: canonicalProjectedHourlyNet(registry),
  canonicalAssetValue: canonicalAssetValue(registry),
  specializedKinds,
  categoryVisualKeys: specializedKinds.map((kind) => [kind, getBusinessDisplayMeta(kind).visualKey]),
}, null, 2));
