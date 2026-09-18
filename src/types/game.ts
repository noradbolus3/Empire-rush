export interface PlayerState {
  cash: number;
  netWorth: number;
  clickPower: number;
  clickUpgradeCost: number;
  activeBoostUntil: number;
  office: 'Citizen' | 'Governor_Maryland' | 'President_USA';
  theme: 'Standard_Dark' | 'Obsidian_Stealth' | '24K_Gold';
}

export type BusinessSector = 'Retail' | 'Mobility' | 'Logistics' | 'Tech_SaaS' | 'Manufacturing' | 'Restaurant' | 'Construction';
export type OperatingMode = 'Licensed_Legal' | 'Shadow_Underground';
export type HygieneRating = 'A' | 'B' | 'C' | 'F';
export interface WorkforceState { headcount: number; morale: number; automationManagerHired: boolean; }
export interface RetailResources { kind: 'retail'; stockUnits: number; maxCapacity: number; wholesaleRestockContract: boolean; automatedPOSShelving: boolean; profitMarginPercent: number; floorStage: 'Corner Kiosk' | 'Convenience Store' | 'Supermarket'; customerFootfallPerHour: number; }
export interface MobilityResources { kind: 'mobility'; fleetCondition: number; economySedans: number; executiveEVs: number; luxuryCabs: number; gpsAIDispatcher: boolean; evSuperchargers: boolean; serviceDue: boolean; surgePricing: boolean; customerRating: number; }
export interface LogisticsResources { kind: 'logistics'; warehouseCapacityBoxes: number; warehouseUsedBoxes: number; activeTrucks: number; dispatchedTrucks: number; longHaulSemis: number; automatedSortingConveyor: boolean; delayedShipmentPenalty: number; }
export interface TechResources { kind: 'tech'; serverBandwidthUsers: number; activeUsers: number; techDebtBugs: number; seniorEngineers: number; devOpsLead: boolean; }
export interface ManufacturingResources { kind: 'manufacturing'; rawMaterialPallets: number; machineryWearPercent: number; roboticAssemblyArms: boolean; industrialGenerator: boolean; emergencyTechnicianDue: boolean; }
export interface RestaurantResources { kind: 'restaurant'; freshIngredientsShelfLifeSeconds: number; ingredientUnits: number; hygieneRating: HygieneRating; executiveHeadChef: boolean; sousChefs: number; dishwashers: number; }
export interface ConstructionResources { kind: 'construction'; heavyEquipmentCranes: number; activeMilestoneContracts: number; maintainedEquipment: boolean; safetyIncidentDue: boolean; }
export type BusinessResources = RetailResources | MobilityResources | LogisticsResources | TechResources | ManufacturingResources | RestaurantResources | ConstructionResources;

export interface BusinessEntity {
  id: string; name: string; registeredName?: string; sector: BusinessSector; icon: string; operatingMode: OperatingMode; stage: number; stageName: string; isOwned: boolean; baseCost: number; baseHourlyRevenue: number; monthlyExpenses: { rent: number; payroll: number; maintenance: number; inventoryOrCloudCOGS: number }; policeHeat: number; stabilityIndex: number; workforce: WorkforceState; operationalLog: string[]; resources: BusinessResources; frozenUntil?: number;
}
export interface StockItem { ticker: string; name: string; type: 'Stock' | 'Crypto'; price: number; history: number[]; sharesOwned: number; avgBuyPrice: number; }
export interface LifestyleItem { id: string; name: string; brand: string; category: 'Hypercar' | 'Aviation' | 'Yacht' | 'Real_Estate' | 'State_Asset'; price: number; monthlyUpkeep: number; prestigePoints: number; imageUrl: string; isOwned: boolean; requiresOffice?: 'President_USA'; }
export interface ElectionCycle { id: 'Governor_Maryland' | 'President_USA'; title: string; durationRealDays: number; seasonEndsAtUTC: number; candidates: { id: string; name: string; isPlayer: boolean; votes: number; warChest: number; taxPromiseText: string }[]; }
