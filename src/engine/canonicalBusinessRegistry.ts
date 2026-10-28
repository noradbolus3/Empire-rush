import type { BusinessEntity } from "../types/business";
import type { TaxiCompanyState } from "../types/taxi";
import { taxiHourlyEconomics, taxiVehicleCount } from "../types/taxi";
import type { ShippingCompanyState } from "../types/shipping";
import { shippingEconomics, shippingVehicleCount } from "../types/shipping";
import type { FactoryCompanyState } from "../types/factory";
import { factoryEconomics } from "../types/factory";
import type { ConstructionCompanyState } from "../types/construction";
import { constructionTick } from "../types/construction";
import type { DealershipState } from "../types/dealership";
import { dealershipSellTick } from "../types/dealership";
import type { SoftwareCompanyState } from "../types/software";
import { softwareSettlementTick } from "../types/software";
import type { SportsClubState } from "../types/sportsClub";
import { projectedHourlyRevenue as sportsHourlyRevenue } from "./sportsClubEngine";
import type { OilGasState } from "../types/oilGas";
import { projectedHourlyProfit as oilGasHourlyProfit } from "./oilGasEngine";
import type { AirlineState } from "../types/airline";
import { projectedHourlyProfit as airlineHourlyProfit } from "./airlineEngine";
import type { HotelState } from "../types/hotel";
import { projectedHourlyProfit as hotelHourlyProfit } from "./hotelEngine";
import type { BlockchainState } from "../types/blockchain";
import { projectedHourlyProfit as blockchainHourlyProfit } from "./blockchainEngine";
import type { SpaceState } from "../types/space";
import { projectedHourlyProfit as spaceHourlyProfit } from "./spaceEngine";
import type { HoldingState } from "../types/holding";
import { consolidatedHourlyProfit } from "./holdingEngine";
import { constructionAssetValue } from "./constructionCompanyEngine";
import type { ITSoftwareData } from "../types/business";
import { itCompanyAssetValue, itHourlyProfit } from "./itCompanyEngine";
import type { BankingData } from "../types/business";
import { bankingCompanyAssetValue, bankingHourlyProfit } from "./bankingCompanyEngine";

export type CanonicalBusinessKind =
  | "generic"
  | "taxi"
  | "shipping"
  | "factory"
  | "construction"
  | "dealership"
  | "software"
  | "sports"
  | "oilGas"
  | "airline"
  | "hotel"
  | "blockchain"
  | "space"
  | "holding";

export type CanonicalBusiness = {
  id: string;
  name: string;
  kind: CanonicalBusinessKind;
  owned: boolean;
  operating: boolean;
  /** Gross projected hourly revenue from the owning engine. */
  hourlyRevenue: number;
  /** Projected hourly operating expenses from the owning engine. */
  hourlyExpenses: number;
  /** Net projected hourly cashflow. */
  hourlyNet: number;
  /** Realized foreground amount waiting for the next central settlement. */
  pendingSettlementAmount: number;
  /** Asset value attributable to this record, excluding cash and debt. */
  assetValue: number;
  /** Management layers are shown/countable but do not re-credit subsidiary cashflow. */
  consolidatesOtherBusinesses: boolean;
  source: "generic-state" | "specialized-state";
};

export type CanonicalBusinessInput = {
  businesses: BusinessEntity[];
  taxiCompany?: TaxiCompanyState | null;
  shippingCompany?: ShippingCompanyState | null;
  factoryCompany?: FactoryCompanyState | null;
  constructionCompany?: ConstructionCompanyState | null;
  dealership?: DealershipState | null;
  softwareCompany?: SoftwareCompanyState | null;
  sportsClub?: SportsClubState | null;
  oilGas?: OilGasState | null;
  airline?: AirlineState | null;
  hotel?: HotelState | null;
  blockchain?: BlockchainState | null;
  space?: SpaceState | null;
  holding?: HoldingState | null;
};

const finite = (value: unknown) =>
  Number.isFinite(Number(value)) ? Number(value) : 0;
const nonNegative = (value: unknown) => Math.max(0, finite(value));
const money = (value: number) => Number(Math.max(0, value).toFixed(2));

function record(
  input: Omit<CanonicalBusiness, "hourlyNet"> & { hourlyNet?: number },
): CanonicalBusiness {
  const hourlyRevenue = money(input.hourlyRevenue);
  const hourlyExpenses = money(input.hourlyExpenses);
  return {
    ...input,
    hourlyRevenue,
    hourlyExpenses,
    hourlyNet: money(input.hourlyNet ?? hourlyRevenue - hourlyExpenses),
    pendingSettlementAmount: money(input.pendingSettlementAmount),
    assetValue: money(input.assetValue),
  };
}

function genericRecord(business: BusinessEntity): CanonicalBusiness {
  let assetValue = nonNegative(business.acquisitionCost);
  if (business.sector === "Retail") {
    assetValue += nonNegative(business.stockUnits) * nonNegative(business.unitWholesaleCost);
  }
  if (business.sector === "Construction_Mega") {
    assetValue = constructionAssetValue(business);
  }
  if (business.sector === "Tech_SaaS") {
    assetValue = itCompanyAssetValue(business as ITSoftwareData);
  }
  if (business.sector === "Banking") {
    assetValue = bankingCompanyAssetValue(business as BankingData);
  }
  return record({
    id: business.id,
    name: business.name,
    kind: "generic",
    owned: Boolean(business.isAcquired),
    operating: Boolean(business.isAcquired),
    hourlyRevenue: nonNegative(business.hourlyNetProfit),
    hourlyExpenses: 0,
    hourlyNet: nonNegative(business.hourlyNetProfit),
    pendingSettlementAmount: nonNegative(business.pendingSettlementAmount),
    assetValue,
    consolidatesOtherBusinesses: false,
    source: "generic-state",
  });
}

function taxiRecord(state: TaxiCompanyState): CanonicalBusiness {
  const economics = taxiHourlyEconomics(state);
  const owned = state.status === "operating" || taxiVehicleCount(state) > 0 || state.cashInvested > 0;
  return record({
    id: state.id,
    name: state.name,
    kind: "taxi",
    owned,
    operating: state.status === "operating",
    hourlyRevenue: economics.revenue,
    hourlyExpenses: economics.expenses,
    hourlyNet: economics.net,
    pendingSettlementAmount: 0,
    assetValue: state.cashInvested + taxiVehicleCount(state) * 12000 + state.depotLevel * 25000,
    consolidatesOtherBusinesses: false,
    source: "specialized-state",
  });
}

function shippingRecord(state: ShippingCompanyState): CanonicalBusiness {
  const economics = shippingEconomics(state);
  const owned = state.status === "operating" || shippingVehicleCount(state) > 0 || state.cashInvested > 0;
  return record({
    id: state.id,
    name: state.name,
    kind: "shipping",
    owned,
    operating: state.status === "operating",
    hourlyRevenue: economics.revenue,
    hourlyExpenses: economics.expenses,
    hourlyNet: economics.net,
    pendingSettlementAmount: 0,
    assetValue: state.cashInvested + state.vans * 18000 + state.trucks * 75000 + state.warehouseLevel * 30000,
    consolidatesOtherBusinesses: false,
    source: "specialized-state",
  });
}

function factoryRecord(state: FactoryCompanyState): CanonicalBusiness {
  const economics = factoryEconomics(state);
  const owned = state.status === "operating" || state.machineLines > 0 || state.cashInvested > 0;
  return record({
    id: state.id,
    name: state.name,
    kind: "factory",
    owned,
    operating: state.status === "operating",
    hourlyRevenue: economics.revenue,
    hourlyExpenses: economics.expenses,
    hourlyNet: economics.net,
    pendingSettlementAmount: 0,
    assetValue: state.cashInvested + state.machineLines * 75000 + state.finishedGoods * 8,
    consolidatesOtherBusinesses: false,
    source: "specialized-state",
  });
}

function constructionRecord(state: ConstructionCompanyState): CanonicalBusiness {
  const tick = constructionTick(state);
  const owned = state.status === "operating" || state.landParcels > 0 || state.cashInvested > 0;
  return record({
    id: state.id,
    name: state.name,
    kind: "construction",
    owned,
    operating: state.status === "operating",
    hourlyRevenue: tick.revenue,
    hourlyExpenses: tick.expenses,
    hourlyNet: tick.cashDelta,
    pendingSettlementAmount: 0,
    assetValue: state.cashInvested + state.landParcels * 45000 + state.excavators * 80000 + state.cranes * 150000 + state.mixers * 60000,
    consolidatesOtherBusinesses: false,
    source: "specialized-state",
  });
}

function dealershipRecord(state: DealershipState): CanonicalBusiness {
  const tick = dealershipSellTick(state);
  const owned = state.status === "operating" || state.showroomSize > 0 || state.cashInvested > 0;
  return record({
    id: state.id,
    name: state.name,
    kind: "dealership",
    owned,
    operating: state.status === "operating",
    hourlyRevenue: tick.revenue,
    hourlyExpenses: tick.cost,
    hourlyNet: tick.profit,
    pendingSettlementAmount: 0,
    assetValue: state.cashInvested + state.inventory * 18000 + state.showroomSize * 100000,
    consolidatesOtherBusinesses: false,
    source: "specialized-state",
  });
}

function softwareRecord(state: SoftwareCompanyState): CanonicalBusiness {
  const tick = softwareSettlementTick(state);
  const owned = state.status === "operating" || state.offices > 0 || state.cashInvested > 0;
  return record({
    id: state.id,
    name: state.name,
    kind: "software",
    owned,
    operating: state.status === "operating",
    hourlyRevenue: tick.revenue,
    hourlyExpenses: tick.expenses,
    hourlyNet: tick.profit,
    pendingSettlementAmount: 0,
    assetValue: state.cashInvested + state.offices * 120000 + state.saasProducts * 50000 + state.subscribers * 14,
    consolidatesOtherBusinesses: false,
    source: "specialized-state",
  });
}

function sportsRecord(state: SportsClubState): CanonicalBusiness {
  const revenue = sportsHourlyRevenue(state);
  const expenses = nonNegative(state.payrollPerSettlement);
  const owned = state.cashReserve > 0 || state.teams > 0 || state.stadiumCapacity > 0;
  return record({
    id: state.id,
    name: state.clubName,
    kind: "sports",
    owned,
    operating: owned,
    hourlyRevenue: revenue + expenses,
    hourlyExpenses: expenses,
    hourlyNet: revenue,
    pendingSettlementAmount: 0,
    assetValue: state.cashReserve + state.stadiumCapacity * 35 + state.teams * 25000,
    consolidatesOtherBusinesses: false,
    source: "specialized-state",
  });
}

function oilGasRecord(state: OilGasState): CanonicalBusiness {
  const net = oilGasHourlyProfit(state);
  const expenses = state.fields * 250 + state.offshorePlatforms * 900 + state.stationEmployees * 18 + state.tankerFleet * 150;
  const owned = state.fields > 0 || state.fuelStations > 0 || state.cashReserve > 0;
  return record({
    id: state.id,
    name: state.companyName,
    kind: "oilGas",
    owned,
    operating: owned,
    hourlyRevenue: net + expenses,
    hourlyExpenses: expenses,
    hourlyNet: net,
    pendingSettlementAmount: 0,
    assetValue: state.cashReserve + state.fields * 50000 + state.drillingRigs * 80000 + state.refineryCapacity * 12,
    consolidatesOtherBusinesses: false,
    source: "specialized-state",
  });
}

function airlineRecord(state: AirlineState): CanonicalBusiness {
  const net = airlineHourlyProfit(state);
  const expenses = state.aircraft * state.flightHours * state.fuelPrice * 45 + state.aircraft * 90 + state.crew * 9 + state.routes * 30 + state.hubs * 60;
  const owned = state.aircraft > 0 || state.routes > 0 || state.cashReserve > 0;
  return record({
    id: state.id,
    name: state.companyName,
    kind: "airline",
    owned,
    operating: owned,
    hourlyRevenue: net + expenses,
    hourlyExpenses: expenses,
    hourlyNet: net,
    pendingSettlementAmount: 0,
    assetValue: state.cashReserve + state.aircraft * 2_500_000 + state.hubs * 500000,
    consolidatesOtherBusinesses: false,
    source: "specialized-state",
  });
}

function hotelRecord(state: HotelState): CanonicalBusiness {
  const net = hotelHourlyProfit(state);
  const expenses = state.properties * 40 + state.staff * 4 + state.managers * 15 + state.rooms + state.maintenanceLevel * 20;
  const owned = state.properties > 0 || state.rooms > 0 || state.cashReserve > 0;
  return record({
    id: state.id,
    name: state.companyName,
    kind: "hotel",
    owned,
    operating: owned,
    hourlyRevenue: net + expenses,
    hourlyExpenses: expenses,
    hourlyNet: net,
    pendingSettlementAmount: 0,
    assetValue: state.cashReserve + state.properties * 250000 + state.rooms * 18000,
    consolidatesOtherBusinesses: false,
    source: "specialized-state",
  });
}

function blockchainRecord(state: BlockchainState): CanonicalBusiness {
  const net = blockchainHourlyProfit(state);
  const expenses = state.servers * 70 + state.developers * 22 + state.storageTb * 0.8 + state.securityLevel * 35 + state.offices * 90;
  const owned = state.servers > 0 || state.products > 1 || state.cashReserve > 0;
  return record({
    id: state.id,
    name: state.companyName,
    kind: "blockchain",
    owned,
    operating: owned,
    hourlyRevenue: net + expenses,
    hourlyExpenses: expenses,
    hourlyNet: net,
    pendingSettlementAmount: 0,
    assetValue: state.cashReserve + state.servers * 100000 + state.products * 50000 + state.offices * 250000,
    consolidatesOtherBusinesses: false,
    source: "specialized-state",
  });
}

function spaceRecord(state: SpaceState): CanonicalBusiness {
  const net = spaceHourlyProfit(state);
  const expenses = state.engineers * 24 + state.assemblyLines * 100 + state.launchPads * 80 + state.satellites * 10 + state.activeMissions * 70;
  const owned = state.launches > 0 || state.satellites > 0 || state.cashReserve > 0;
  return record({
    id: state.id,
    name: state.companyName,
    kind: "space",
    owned,
    operating: owned,
    hourlyRevenue: net + expenses,
    hourlyExpenses: expenses,
    hourlyNet: net,
    pendingSettlementAmount: 0,
    assetValue: state.cashReserve + state.assemblyLines * 250000 + state.satellites * 100000 + state.launchPads * 150000,
    consolidatesOtherBusinesses: false,
    source: "specialized-state",
  });
}

function holdingRecord(state: HoldingState): CanonicalBusiness {
  const net = consolidatedHourlyProfit(state);
  // Holding subsidiaries remain represented by their own records. Only the
  // holding layer's incremental synergy is counted here, avoiding double credit.
  const subsidiaryNet = state.subsidiaries.reduce((sum, item) => sum + nonNegative(item.revenuePerHour - item.expensesPerHour), 0);
  const incrementalNet = Math.max(0, net - subsidiaryNet);
  const owned = state.acquisitionsCompleted > 0 || state.hqLevel > 0 || state.cashReserve > 0;
  return record({
    id: state.id,
    name: state.companyName,
    kind: "holding",
    owned,
    operating: owned,
    hourlyRevenue: incrementalNet,
    hourlyExpenses: 0,
    hourlyNet: incrementalNet,
    pendingSettlementAmount: 0,
    assetValue: state.cashReserve + state.hqLevel * 250000 + state.sharedServicesLevel * 100000,
    consolidatesOtherBusinesses: true,
    source: "specialized-state",
  });
}

export function buildCanonicalBusinessRegistry(input: CanonicalBusinessInput): CanonicalBusiness[] {
  const records: CanonicalBusiness[] = input.businesses.map(genericRecord);
  const specialized = [
    input.taxiCompany && taxiRecord(input.taxiCompany),
    input.shippingCompany && shippingRecord(input.shippingCompany),
    input.factoryCompany && factoryRecord(input.factoryCompany),
    input.constructionCompany && constructionRecord(input.constructionCompany),
    input.dealership && dealershipRecord(input.dealership),
    input.softwareCompany && softwareRecord(input.softwareCompany),
    input.sportsClub && sportsRecord(input.sportsClub),
    input.oilGas && oilGasRecord(input.oilGas),
    input.airline && airlineRecord(input.airline),
    input.hotel && hotelRecord(input.hotel),
    input.blockchain && blockchainRecord(input.blockchain),
    input.space && spaceRecord(input.space),
    input.holding && holdingRecord(input.holding),
  ].filter((item): item is CanonicalBusiness => Boolean(item));
  const seen = new Set(records.map((item) => item.id));
  return [...records, ...specialized.filter((item) => !seen.has(item.id))];
}

export function canonicalActiveCount(registry: CanonicalBusiness[]): number {
  return registry.filter((item) => item.owned && item.operating).length;
}

export function canonicalProjectedHourlyNet(registry: CanonicalBusiness[]): number {
  return registry
    .filter((item) => item.owned && item.operating)
    .reduce((sum, item) => sum + item.hourlyNet, 0);
}

export function canonicalAssetValue(registry: CanonicalBusiness[]): number {
  return registry.filter((item) => item.owned).reduce((sum, item) => sum + item.assetValue, 0);
}

export function canonicalSettlementRevenue(registry: CanonicalBusiness[]): number {
  return registry
    .filter((item) => item.owned && item.operating)
    .reduce(
      (sum, item) =>
        sum + (item.pendingSettlementAmount > 0 ? item.pendingSettlementAmount : item.hourlyNet),
      0,
    );
}
