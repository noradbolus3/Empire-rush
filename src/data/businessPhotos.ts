// Display-only photos for the business portfolio cards.
export const BUSINESS_PHOTOS: Record<string, number> = {
  "operating-company": require("../../assets/business/operating-company.jpg"),
  "taxi-fleet": require("../../assets/business/taxi-fleet.jpg"),
  "shipping-logistics": require("../../assets/business/shipping-logistics.jpg"),
  "factory-floor": require("../../assets/business/factory-floor.jpg"),
  "construction-site": require("../../assets/business/construction-site.jpg"),
  "dealership-showroom": require("../../assets/business/dealership-showroom.jpg"),
  "software-studio": require("../../assets/business/software-studio.jpg"),
  "sports-arena": require("../../assets/business/sports-arena.jpg"),
  "energy-infrastructure": require("../../assets/business/energy-infrastructure.jpg"),
  "airline-hangar": require("../../assets/business/airline-hangar.jpg"),
  "hotel-property": require("../../assets/business/hotel-property.jpg"),
  "digital-infrastructure": require("../../assets/business/digital-infrastructure.jpg"),
  "aerospace": require("../../assets/business/aerospace.jpg"),
  "real-estate": require("../../assets/business/real-estate.jpg"),
  "banking": require("../../assets/business/banking.jpg"),
  "pharma-lab": require("../../assets/business/pharma-lab.jpg"),
  "media-studio": require("../../assets/business/media-studio.jpg"),
  "holding-group": require("../../assets/business/holding-group.jpg"),
};

const SECTOR_PHOTO: Record<string, string> = {
  retail: "operating-company",
  mobility: "taxi-fleet",
  "tech saas": "software-studio",
  "construction mega": "construction-site",
  banking: "banking",
  "real estate": "real-estate",
  energy: "energy-infrastructure",
  pharma: "pharma-lab",
  media: "media-studio",
  sports: "sports-arena",
  airline: "airline-hangar",
};
/** Pick a sector-specific photo for generic-engine businesses; specialized kinds keep their own key. */
export function photoKeyFor(kind: string | undefined, sector: string | undefined, fallback: string): string {
  if (kind && kind !== "generic") return fallback;
  const key = String(sector || "").replace(/_/g, " ").trim().toLowerCase();
  return SECTOR_PHOTO[key] || fallback;
}
