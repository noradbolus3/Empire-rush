import { BusinessItem } from '../types/game';
export function calculateHourlyProfit(business: BusinessItem, governorTaxReduction = 0): number {
  const expenses = (business.monthlyExpenses.rent + business.monthlyExpenses.payroll + business.monthlyExpenses.inventoryOrCloudCOGS) / (30 * 24);
  const base = Math.max(0, business.hourlyGrossRevenue - expenses);
  if (business.operatingMode === 'Shadow_Underground') return base * 1.6;
  return base * Math.max(0, 1 - Math.max(0, 0.15 - governorTaxReduction));
}
export function advanceShadowHeat(business: BusinessItem, activeHours: number): BusinessItem { if (business.operatingMode !== 'Shadow_Underground') return { ...business, policeHeat: 0 }; return { ...business, policeHeat: Math.min(100, business.policeHeat + activeHours * 2.5) }; }
export function resolveRaid(business: BusinessItem, action: 'bribe' | 'court', cash: number): { business: BusinessItem; cash: number; won: boolean } { if (action === 'bribe') return { business: { ...business, policeHeat: 0 }, cash: Math.max(0, cash * .7), won: true }; const won = Math.random() >= .5; return { business: { ...business, policeHeat: won ? 0 : 35, isOwned: won ? business.isOwned : false }, cash, won }; }
