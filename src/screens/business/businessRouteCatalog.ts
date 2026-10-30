import type { BusinessEntity } from "../../types/business";
import type { CanonicalBusinessKind } from "../../engine/canonicalBusinessRegistry";

export const BUSINESS_PORTFOLIO_ROUTE_ID = "business-portfolio" as const;

export type BusinessRouteScreen =
  | "portfolio"
  | "business-master-hub"
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

export type BusinessRouteEntry = {
  readonly kind: CanonicalBusinessKind;
  readonly routeId: string;
  readonly label: string;
  readonly screen: BusinessRouteScreen;
  readonly stableIds: readonly string[];
  readonly stateKey: string;
  readonly supportsDirectLaunch: boolean;
};

/**
 * The single source of truth for Business Portfolio routing.
 *
 * Generic records intentionally use the BusinessMasterHub. Specialized records
 * retain their existing domain screens and state engines; this catalog only
 * decides which already-existing screen receives the route.
 */
export const BUSINESS_ROUTE_CATALOG: readonly BusinessRouteEntry[] = [
  {
    kind: "generic",
    routeId: "business-generic",
    label: "Operating Company",
    screen: "business-master-hub",
    stableIds: [],
    stateKey: "businesses",
    supportsDirectLaunch: false,
  },
  {
    kind: "taxi",
    routeId: "business-taxi",
    label: "Taxi Company",
    screen: "taxi",
    stableIds: ["empire-taxi-company"],
    stateKey: "taxiCompany",
    supportsDirectLaunch: true,
  },
  {
    kind: "shipping",
    routeId: "business-shipping",
    label: "Shipping Company",
    screen: "shipping",
    stableIds: ["empire-shipping-company"],
    stateKey: "shippingCompany",
    supportsDirectLaunch: true,
  },
  {
    kind: "factory",
    routeId: "business-factory",
    label: "Factory Company",
    screen: "factory",
    stableIds: ["empire-factory-company"],
    stateKey: "factoryCompany",
    supportsDirectLaunch: true,
  },
  {
    kind: "construction",
    routeId: "business-construction",
    label: "Construction Company",
    screen: "construction",
    stableIds: ["empire-construction-company", "titan-infrastructure"],
    stateKey: "constructionCompany",
    supportsDirectLaunch: true,
  },
  {
    kind: "dealership",
    routeId: "business-dealership",
    label: "Car Dealership",
    screen: "dealership",
    stableIds: ["empire-car-dealership"],
    stateKey: "dealership",
    supportsDirectLaunch: true,
  },
  {
    kind: "software",
    routeId: "business-software",
    label: "IT & Software Company",
    screen: "software",
    stableIds: ["empire-software-company", "cyberpulse-saas"],
    stateKey: "softwareCompany",
    supportsDirectLaunch: true,
  },
  {
    kind: "sports",
    routeId: "business-sports",
    label: "Sports Club Company",
    screen: "sports",
    stableIds: ["sports-club-company", "summit-sports"],
    stateKey: "sportsClub",
    supportsDirectLaunch: true,
  },
  {
    kind: "oilGas",
    routeId: "business-oil-gas",
    label: "Oil & Gas Company",
    screen: "oilGas",
    stableIds: ["oil-gas-company"],
    stateKey: "oilGas",
    supportsDirectLaunch: true,
  },
  {
    kind: "airline",
    routeId: "business-airline",
    label: "Airline Company",
    screen: "airline",
    stableIds: ["airline-company", "atlas-air"],
    stateKey: "airline",
    supportsDirectLaunch: true,
  },
  {
    kind: "hotel",
    routeId: "business-hotel",
    label: "Hotel & Hospitality Company",
    screen: "hotel",
    stableIds: ["hotel-company"],
    stateKey: "hotel",
    supportsDirectLaunch: true,
  },
  {
    kind: "blockchain",
    routeId: "business-blockchain",
    label: "Blockchain & Digital Technology",
    screen: "blockchain",
    stableIds: ["blockchain-company"],
    stateKey: "blockchain",
    supportsDirectLaunch: true,
  },
  {
    kind: "space",
    routeId: "business-space",
    label: "Space & Aerospace Company",
    screen: "space",
    stableIds: ["space-company"],
    stateKey: "space",
    supportsDirectLaunch: true,
  },
  {
    kind: "holding",
    routeId: "business-holding",
    label: "Holding Company & Mergers",
    screen: "holding",
    stableIds: ["holding-company"],
    stateKey: "holding",
    supportsDirectLaunch: true,
  },
] as const;

export const BUSINESS_ROUTE_BACK_HANDLERS: Readonly<
  Record<BusinessRouteScreen, string>
> = {
  portfolio: "business-portfolio",
  "business-master-hub": "setSelectedId(null)",
  taxi: "setTaxiOpen(false)",
  shipping: "setShippingOpen(false)",
  factory: "setFactoryOpen(false)",
  construction: "setConstructionOpen(false)",
  dealership: "setDealershipOpen(false)",
  software: "setSoftwareOpen(false)",
  sports: "setSportsOpen(false)",
  oilGas: "setOilGasOpen(false)",
  airline: "setAirlineOpen(false)",
  hotel: "setHotelOpen(false)",
  blockchain: "setBlockchainOpen(false)",
  space: "setSpaceOpen(false)",
  holding: "setHoldingOpen(false)",
};

const ROUTES_BY_KIND = new Map(
  BUSINESS_ROUTE_CATALOG.map((entry) => [entry.kind, entry]),
);
const ROUTES_BY_ID = new Map(
  BUSINESS_ROUTE_CATALOG.flatMap((entry) =>
    entry.stableIds.map((id) => [id, entry] as const),
  ),
);

export function getBusinessRouteByKind(
  kind: CanonicalBusinessKind,
): BusinessRouteEntry {
  return ROUTES_BY_KIND.get(kind) ?? ROUTES_BY_KIND.get("generic")!;
}

export function getBusinessRouteById(id: string): BusinessRouteEntry | null {
  return ROUTES_BY_ID.get(id) ?? null;
}

export function getBusinessRouteForEntity(
  business: Pick<BusinessEntity, "id" | "sector">,
): BusinessRouteEntry {
  const stableRoute = getBusinessRouteById(business.id);
  if (stableRoute) return stableRoute;

  switch (business.sector) {
    case "Mobility":
      return getBusinessRouteByKind("taxi");
    case "Tech_SaaS":
      return getBusinessRouteByKind("software");
    case "Construction_Mega":
      return getBusinessRouteByKind("construction");
    case "Sports":
      return getBusinessRouteByKind("sports");
    case "Airline":
      return getBusinessRouteByKind("airline");
    case "Banking":
      return getBusinessRouteByKind("generic");
    default:
      return getBusinessRouteByKind("generic");
  }
}

export function getBusinessRouteForScreen(
  screen: BusinessRouteScreen,
): BusinessRouteEntry | null {
  return BUSINESS_ROUTE_CATALOG.find((entry) => entry.screen === screen) ?? null;
}
