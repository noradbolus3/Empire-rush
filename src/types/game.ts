export interface PlayerState {
  cash: number;
  netWorth: number;
  clickPower: number;
  clickUpgradeCost: number;
  activeBoostUntil: number;
  office: 'Citizen' | 'Governor_Maryland' | 'President_USA';
  theme: 'Standard_Dark' | 'Obsidian_Stealth' | '24K_Gold';
}

export interface BusinessItem {
  id: string; name: string; category: 'Shop' | 'Taxi' | 'Delivery' | 'Tech_SaaS' | 'Manufacturing';
  operatingMode: 'Licensed_Legal' | 'Shadow_Underground'; stage: number; stageName: string; isOwned: boolean; baseCost: number; hourlyGrossRevenue: number;
  monthlyExpenses: { rent: number; payroll: number; inventoryOrCloudCOGS: number };
  policeHeat: number;
  fleet?: { economyCabs: number; executiveEVs: number; luxurySedans: number };
  serverCapacityUsers?: number;
}

export interface StockItem { ticker: string; name: string; type: 'Stock' | 'Crypto'; price: number; history: number[]; sharesOwned: number; avgBuyPrice: number; }
export interface LifestyleItem { id: string; name: string; brand: string; category: 'Hypercar' | 'Aviation' | 'Yacht' | 'Real_Estate' | 'State_Asset'; price: number; monthlyUpkeep: number; prestigePoints: number; imageUrl: string; isOwned: boolean; requiresOffice?: 'President_USA'; }
export interface ElectionCycle { id: 'Governor_Maryland' | 'President_USA'; title: string; durationRealDays: number; seasonEndsAtUTC: number; candidates: { id: string; name: string; isPlayer: boolean; votes: number; warChest: number; taxPromiseText: string }[]; }
