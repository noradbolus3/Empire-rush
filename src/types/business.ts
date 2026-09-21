export type OperatingStructure = 'Licensed_Legal' | 'Shadow_Underground';
export type LegalStatus = OperatingStructure;
export type SectorType = 'Retail' | 'Mobility' | 'Tech_SaaS' | 'Construction_Mega' | 'Real_Estate' | 'Energy' | 'Pharma' | 'Media' | 'Sports' | 'Airline';
export type BusinessCategory = SectorType;

export interface BaseBusiness {
  id: string;
  name: string;
  sector: SectorType;
  isUnlocked: boolean;
  unlockNetWorthRequired: number;
  isAcquired: boolean;
  acquisitionCost: number;
  legalStatus: LegalStatus;
  policeHeat: number;
  stability: number;
  hourlyNetProfit: number;
  branchCount?: number;
  staffCount?: number;
  managerHired?: boolean;
  upgradeLevel?: number;
  reputation?: number;
  customerSatisfaction?: number;
  contractSecondsRemaining?: number;
  contractReward?: number;
  activeEvent?: string;
}
export interface RetailData extends BaseBusiness {
  sector: 'Retail'; stockUnits: number; maxStockCapacity: number; pricingTier: 'Discount' | 'Standard' | 'Luxury'; hasSecurity: boolean; hasManager: boolean; onboardingStep?: 'ORDER_STOCK' | 'WATCH_FIRST_SALE' | 'COMPLETE'; unitWholesaleCost?: number; monthlyRent?: number; monthlyPayroll?: number;
}
export interface MobilityData extends BaseBusiness {
  sector: 'Mobility'; economySedans: number; electricEVs: number; luxuryLimos: number; fleetHealth: number; surgeActive: boolean;
}
export interface SaaSData extends BaseBusiness {
  sector: 'Tech_SaaS'; activeSubscribers: number; serverCapacity: number; openBugs: number;
}
export interface ConstructionData extends BaseBusiness {
  sector: 'Construction_Mega'; activeTenderName: string | null; projectPhase: 0 | 1 | 2 | 3; phaseProgressPercent: number; projectEscrowPayout: number; machineryDispatched?: boolean; safetyCleared?: boolean;
}
export type ExpansionSector = 'Real_Estate' | 'Energy' | 'Pharma' | 'Media' | 'Sports' | 'Airline';
export interface ExpansionData extends BaseBusiness {
  sector: ExpansionSector;
  branchCount: number;
  staffCount: number;
  managerHired: boolean;
  upgradeLevel: number;
  reputation: number;
  customerSatisfaction: number;
  contractSecondsRemaining: number;
  contractReward: number;
  activeEvent: string;
}
export type BusinessEntity = RetailData | MobilityData | SaaSData | ConstructionData | ExpansionData;

/** Legacy detailed retail model used by the first playable retail hub. */
export interface RetailBusinessState {
  id: string; name: string; category: 'Retail'; isAcquired: boolean; legalStructure: OperatingStructure; policeHeat: number; stabilityScore: number; stockUnits: number; maxWarehouseCapacity: number; unitWholesaleCost: number; unitSellingPrice: number; pricingMode: 'Discount' | 'Standard' | 'Luxury'; customerFootfallPerHour: number; hasColdStorage: boolean; hasPalletLifters: boolean; activeSupplierTier: 'Local_Market' | 'Regional_Wholesale' | 'Direct_Factory'; cashiersCount: number; hasSecuritySquad: boolean; hasStoreManager: boolean; staffMorale: number; activeCampaign: 'None' | 'Flyers' | 'Social_Ads' | 'Billboard'; campaignExpiresAtUTC: number; recentTransactions: Array<{ id: string; type: 'RESTOCK' | 'SALE' | 'WAGE' | 'UPGRADE'; amount: number; description: string; timestamp: number }>;
}
