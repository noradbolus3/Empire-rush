import AsyncStorage from '@react-native-async-storage/async-storage';
import { BusinessEntity, ConstructionData, MobilityData, RetailData, SaaSData } from '../types/business';

export const BUSINESS_SIMULATION_SAVE = 'empire-rush-unified-businesses-v2';
export const DEFAULT_BUSINESSES: BusinessEntity[] = [
  { id: 'apex-retail', name: 'Apex Retail Supermarket', sector: 'Retail', isUnlocked: true, unlockNetWorthRequired: 0, isAcquired: false, acquisitionCost: 2500, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 92, hourlyNetProfit: 0, stockUnits: 0, maxStockCapacity: 2500, pricingTier: 'Standard', hasSecurity: false, hasManager: false, unitWholesaleCost: 2, monthlyRent: 800, monthlyPayroll: 1200 },
  { id: 'metro-mobility', name: 'Metro Mobility Taxi Fleet', sector: 'Mobility', isUnlocked: false, unlockNetWorthRequired: 25000, isAcquired: false, acquisitionCost: 25000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 90, hourlyNetProfit: 0, economySedans: 10, electricEVs: 0, luxuryLimos: 0, fleetHealth: 100, surgeActive: false },
  { id: 'cyberpulse-saas', name: 'CyberPulse SaaS Studio', sector: 'Tech_SaaS', isUnlocked: false, unlockNetWorthRequired: 100000, isAcquired: false, acquisitionCost: 100000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 88, hourlyNetProfit: 0, activeSubscribers: 0, serverCapacity: 25000, openBugs: 0 },
  { id: 'titan-infrastructure', name: 'Titan Mega Infrastructure', sector: 'Construction_Mega', isUnlocked: false, unlockNetWorthRequired: 500000, isAcquired: false, acquisitionCost: 50000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 85, hourlyNetProfit: 0, activeTenderName: null, projectPhase: 0, phaseProgressPercent: 0, projectEscrowPayout: 1200000, machineryDispatched: false, safetyCleared: false },
];
const retailUnits = { Discount: 10, Standard: 5, Luxury: 2 } as const;
const retailPrices = { Discount: 2.8, Standard: 3.8, Luxury: 6.5 } as const;

export type SimulationResult = { businesses: BusinessEntity[]; cashDelta: number; events: string[] };

function retailTick(business: RetailData, seconds: number, events: string[]): { business: RetailData; cashDelta: number } {
  if (!business.isAcquired || business.stockUnits <= 0) return { business: { ...business, hourlyNetProfit: 0 }, cashDelta: 0 };
  const unitsDeducted = Math.min(business.stockUnits, retailUnits[business.pricingTier]);
  const revenueEarned = Number((unitsDeducted * retailPrices[business.pricingTier]).toFixed(2));
  const cogs = Number((unitsDeducted * (business.unitWholesaleCost ?? 2)).toFixed(2));
  const fixedCosts = Number((((business.monthlyRent ?? 800) + (business.monthlyPayroll ?? 1200)) / (30 * 24) * seconds / 3600).toFixed(2));
  const tax = business.legalStatus === 'Licensed_Legal' ? Number((revenueEarned * 0.15).toFixed(2)) : 0;
  const netCashDelta = Number((revenueEarned - cogs - fixedCosts - tax).toFixed(2));
  const hourlyNetProfit = Number((netCashDelta * 3600 / Math.max(1, seconds)).toFixed(2));
  if (business.stockUnits - unitsDeducted === 0) events.push(`${business.name}: shelves empty; sales halted.`);
  return { business: { ...business, stockUnits: business.stockUnits - unitsDeducted, hourlyNetProfit, policeHeat: business.legalStatus === 'Shadow_Underground' ? Math.min(100, business.policeHeat + 0.02) : 0 }, cashDelta: netCashDelta };
}
function mobilityTick(business: MobilityData, seconds: number): { business: MobilityData; cashDelta: number } {
  if (!business.isAcquired) return { business: { ...business, hourlyNetProfit: 0 }, cashDelta: 0 };
  const baseHourly = business.economySedans * 50 + business.electricEVs * 150 + business.luxuryLimos * 400;
  const surged = business.surgeActive ? baseHourly * 1.7 : baseHourly;
  const adjusted = business.fleetHealth < 30 ? surged * .5 : surged;
  return { business: { ...business, fleetHealth: Math.max(0, Number((business.fleetHealth - .05).toFixed(2))), hourlyNetProfit: Number(adjusted.toFixed(2)) }, cashDelta: Number((adjusted * seconds / 3600).toFixed(2)) };
}
function saasTick(business: SaaSData, seconds: number, events: string[]): { business: SaaSData; cashDelta: number } {
  if (!business.isAcquired) return { business: { ...business, hourlyNetProfit: 0 }, cashDelta: 0 };
  let subscribers = business.activeSubscribers;
  if (subscribers > business.serverCapacity) { subscribers = Math.floor(subscribers * .95); events.push(`${business.name}: SERVER OVERLOAD · 5% subscriber churn.`); }
  const hourly = subscribers * 1.2;
  return { business: { ...business, activeSubscribers: subscribers, hourlyNetProfit: Number(hourly.toFixed(2)) }, cashDelta: Number((hourly * seconds / 3600).toFixed(2)) };
}
function constructionTick(business: ConstructionData, elapsedSeconds: number, events: string[]): { business: ConstructionData; cashDelta: number } {
  if (!business.isAcquired || !business.activeTenderName || business.projectPhase === 0) return { business, cashDelta: 0 };
  let next = { ...business }; let cashDelta = 0; let progress = next.phaseProgressPercent;
  if (elapsedSeconds >= 3) progress += 1;
  if (progress >= 100) { if (next.projectPhase < 3) { next = { ...next, projectPhase: (next.projectPhase + 1) as ConstructionData['projectPhase'], phaseProgressPercent: 0 }; events.push(`${next.name}: advanced to construction phase ${next.projectPhase}.`); } else { cashDelta = next.projectEscrowPayout + 50000; events.push(`${next.name}: tender complete; escrow and contractor bonus deposited.`); next = { ...next, activeTenderName: null, projectPhase: 0, phaseProgressPercent: 0, machineryDispatched: false, safetyCleared: false }; } } else next = { ...next, phaseProgressPercent: progress };
  return { business: next, cashDelta };
}

export function simulateBusinessTick(businesses: BusinessEntity[], seconds = 2, constructionElapsedSeconds = seconds): SimulationResult {
  const events: string[] = []; let cashDelta = 0;
  const next = businesses.map(item => { if (item.sector === 'Retail') { const result = retailTick(item, seconds, events); cashDelta += result.cashDelta; return result.business; } if (item.sector === 'Mobility') { const result = mobilityTick(item, seconds); cashDelta += result.cashDelta; return result.business; } if (item.sector === 'Tech_SaaS') { const result = saasTick(item, seconds, events); cashDelta += result.cashDelta; return result.business; } const result = constructionTick(item, constructionElapsedSeconds, events); cashDelta += result.cashDelta; return result.business; });
  return { businesses: next, cashDelta: Number(cashDelta.toFixed(2)), events };
}

export async function loadBusinessSimulation(): Promise<BusinessEntity[]> { try { const raw = await AsyncStorage.getItem(BUSINESS_SIMULATION_SAVE); if (!raw) { await AsyncStorage.setItem(BUSINESS_SIMULATION_SAVE, JSON.stringify(DEFAULT_BUSINESSES)); return DEFAULT_BUSINESSES; } const parsed = JSON.parse(raw); const valid = Array.isArray(parsed) && parsed.length > 0 && parsed.every(item => item && typeof item.id === 'string' && typeof item.name === 'string' && ['Retail', 'Mobility', 'Tech_SaaS', 'Construction_Mega'].includes(item.sector) && typeof item.isAcquired === 'boolean'); if (!valid) throw new Error('Invalid business save'); return parsed as BusinessEntity[]; } catch { await AsyncStorage.setItem(BUSINESS_SIMULATION_SAVE, JSON.stringify(DEFAULT_BUSINESSES)); return DEFAULT_BUSINESSES; } }
export async function persistBusinessSimulation(businesses: BusinessEntity[]) { await AsyncStorage.setItem(BUSINESS_SIMULATION_SAVE, JSON.stringify(businesses)); }
