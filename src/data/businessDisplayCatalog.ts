import type { CanonicalBusinessKind } from "../engine/canonicalBusinessRegistry";

export type BusinessDisplayMeta = {
  readonly kind: CanonicalBusinessKind;
  readonly categoryLabel: string;
  readonly shortLabel: string;
  readonly tagline: string;
  readonly visualKey: string;
  readonly accent: string;
  readonly charterCost: number;
};

/** Display-only metadata. It never controls ownership, accounting or unlocks. */
export const BUSINESS_DISPLAY_CATALOG: readonly BusinessDisplayMeta[] = [
  { kind: "generic", categoryLabel: "OPERATING COMPANY", shortLabel: "Company", tagline: "Build a durable operating cashflow loop.", visualKey: "operating-company", accent: "#5B7FA3", charterCost: 0 },
  { kind: "taxi", categoryLabel: "MOBILITY", shortLabel: "Taxi Company", tagline: "Build a city fleet around reliable demand.", visualKey: "taxi-fleet", accent: "#C39A5B", charterCost: 12000 },
  { kind: "shipping", categoryLabel: "LOGISTICS", shortLabel: "Shipping Company", tagline: "Move cargo, grow routes and compound capacity.", visualKey: "shipping-logistics", accent: "#5C86A8", charterCost: 85000 },
  { kind: "factory", categoryLabel: "MANUFACTURING", shortLabel: "Factory Company", tagline: "Turn machines and materials into scale.", visualKey: "factory-floor", accent: "#7B8794", charterCost: 150000 },
  { kind: "construction", categoryLabel: "INFRASTRUCTURE", shortLabel: "Construction Company", tagline: "Win tenders and deliver valuable projects.", visualKey: "construction-site", accent: "#6FA8C7", charterCost: 180000 },
  { kind: "dealership", categoryLabel: "AUTOMOTIVE", shortLabel: "Car Dealership", tagline: "Turn inventory, showrooms and demand into margin.", visualKey: "dealership-showroom", accent: "#9B7A5D", charterCost: 220000 },
  { kind: "software", categoryLabel: "TECHNOLOGY", shortLabel: "IT & Software Company", tagline: "Ship products, retain clients and scale uptime.", visualKey: "software-studio", accent: "#9B8BC3", charterCost: 260000 },
  { kind: "sports", categoryLabel: "SPORTS & ENTERTAINMENT", shortLabel: "Sports Club Company", tagline: "Build teams, venues and fan momentum.", visualKey: "sports-arena", accent: "#C7936E", charterCost: 250000 },
  { kind: "oilGas", categoryLabel: "ENERGY", shortLabel: "Oil & Gas Company", tagline: "Develop fields, refining and energy distribution.", visualKey: "energy-infrastructure", accent: "#C9A85A", charterCost: 400000 },
  { kind: "airline", categoryLabel: "AVIATION", shortLabel: "Airline Company", tagline: "Fill routes, manage aircraft and expand globally.", visualKey: "airline-hangar", accent: "#7EA5C5", charterCost: 600000 },
  { kind: "hotel", categoryLabel: "HOSPITALITY", shortLabel: "Hotel & Hospitality Company", tagline: "Acquire properties and build guest loyalty.", visualKey: "hotel-property", accent: "#B18872", charterCost: 420000 },
  { kind: "blockchain", categoryLabel: "DIGITAL INFRASTRUCTURE", shortLabel: "Blockchain & Digital Technology", tagline: "Build reliable platforms for enterprise clients.", visualKey: "digital-infrastructure", accent: "#7F8CC4", charterCost: 300000 },
  { kind: "space", categoryLabel: "AEROSPACE", shortLabel: "Space & Aerospace Company", tagline: "Fund launches, missions and advanced systems.", visualKey: "aerospace", accent: "#7186B0", charterCost: 850000 },
  { kind: "holding", categoryLabel: "GROUP MANAGEMENT", shortLabel: "Holding Company & Mergers", tagline: "Consolidate subsidiaries without double-counting them.", visualKey: "holding-group", accent: "#A68BC5", charterCost: 1200000 },
] as const;

const BY_KIND = new Map(
  BUSINESS_DISPLAY_CATALOG.map((entry) => [entry.kind, entry]),
);

export function getBusinessDisplayMeta(
  kind: CanonicalBusinessKind,
): BusinessDisplayMeta {
  return BY_KIND.get(kind) ?? BY_KIND.get("generic")!;
}
