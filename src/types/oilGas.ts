export type OilGasTab = "dashboard" | "exploration" | "refinery" | "storage" | "stations" | "offshore" | "expansion";
export type OilGasStage = "Small Operator" | "Growing Energy Company" | "Integrated Energy Company" | "Global Energy Group";
export type OilGasState = {
  schemaVersion: number; id: "oil-gas-company"; companyName: string; stage: OilGasStage;
  cashReserve: number; oilPrice: number; demandIndex: number; productionBarrels: number;
  fields: number; drillingRigs: number; refineryCapacity: number; refinedInventory: number;
  storageCapacity: number; tankerFleet: number; fuelStations: number; stationEmployees: number;
  offshorePlatforms: number; maintenanceLevel: number; safetyScore: number; internationalContracts: number;
  revenueToDate: number; operatingCostToDate: number; downtimeHours: number; lastEvent: string;
};
export const OIL_GAS_SCHEMA_VERSION = 1;
export const DEFAULT_OIL_GAS: OilGasState = {
  schemaVersion: 1, id: "oil-gas-company", companyName: "BlueCurrent Energy", stage: "Small Operator",
  cashReserve: 0, oilPrice: 78, demandIndex: 100, productionBarrels: 0, fields: 0, drillingRigs: 0,
  refineryCapacity: 0, refinedInventory: 0, storageCapacity: 10000, tankerFleet: 1, fuelStations: 0,
  stationEmployees: 0, offshorePlatforms: 0, maintenanceLevel: 1, safetyScore: 92, internationalContracts: 0,
  revenueToDate: 0, operatingCostToDate: 0, downtimeHours: 0, lastEvent: "Energy charter ready · acquire a field to begin production.",
};
