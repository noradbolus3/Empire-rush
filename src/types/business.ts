export type OperatingStructure = 'Licensed_Legal' | 'Shadow_Underground';
export type BusinessCategory = 'Retail' | 'Mobility' | 'Tech_SaaS' | 'Construction_Mega';

export interface RetailBusinessState {
  id: string;
  name: string;
  category: 'Retail';
  isAcquired: boolean;
  legalStructure: OperatingStructure;
  policeHeat: number;
  stabilityScore: number;
  stockUnits: number;
  maxWarehouseCapacity: number;
  unitWholesaleCost: number;
  unitSellingPrice: number;
  pricingMode: 'Discount' | 'Standard' | 'Luxury';
  customerFootfallPerHour: number;
  hasColdStorage: boolean;
  hasPalletLifters: boolean;
  activeSupplierTier: 'Local_Market' | 'Regional_Wholesale' | 'Direct_Factory';
  cashiersCount: number;
  hasSecuritySquad: boolean;
  hasStoreManager: boolean;
  staffMorale: number;
  activeCampaign: 'None' | 'Flyers' | 'Social_Ads' | 'Billboard';
  campaignExpiresAtUTC: number;
  recentTransactions: Array<{
    id: string;
    type: 'RESTOCK' | 'SALE' | 'WAGE' | 'UPGRADE';
    amount: number;
    description: string;
    timestamp: number;
  }>;
}
