import AsyncStorage from '@react-native-async-storage/async-storage';
import { BusinessEntity, ConstructionData, ExpansionData, ExpansionSector, MobilityData, RetailData, SaaSData } from '../types/business';

export const BUSINESS_SIMULATION_SAVE = 'empire-rush-unified-businesses-v2';
export const BUSINESS_SIMULATION_SAVE_VERSION = 2;
export const DEFAULT_BUSINESSES: BusinessEntity[] = [
  { id: 'apex-retail', name: 'Apex Retail Supermarket', sector: 'Retail', isUnlocked: true, unlockNetWorthRequired: 0, isAcquired: false, acquisitionCost: 2500, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 92, hourlyNetProfit: 0, stockUnits: 0, maxStockCapacity: 2500, pricingTier: 'Standard', hasSecurity: false, hasManager: false, onboardingStep: 'ORDER_STOCK', unitWholesaleCost: 2, monthlyRent: 800, monthlyPayroll: 1200 },
  { id: 'metro-mobility', name: 'Metro Mobility Taxi Fleet', sector: 'Mobility', isUnlocked: false, unlockNetWorthRequired: 25000, isAcquired: false, acquisitionCost: 25000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 90, hourlyNetProfit: 0, economySedans: 10, electricEVs: 0, luxuryLimos: 0, fleetHealth: 100, surgeActive: false },
  { id: 'cyberpulse-saas', name: 'CyberPulse SaaS Studio', sector: 'Tech_SaaS', isUnlocked: false, unlockNetWorthRequired: 100000, isAcquired: false, acquisitionCost: 100000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 88, hourlyNetProfit: 0, activeSubscribers: 0, serverCapacity: 25000, openBugs: 0 },
  { id: 'titan-infrastructure', name: 'Titan Mega Infrastructure', sector: 'Construction_Mega', isUnlocked: false, unlockNetWorthRequired: 500000, isAcquired: false, acquisitionCost: 50000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 85, hourlyNetProfit: 0, activeTenderName: null, projectPhase: 0, phaseProgressPercent: 0, projectEscrowPayout: 250000, machineryDispatched: false, safetyCleared: false },
  { id: 'harbor-estates', name: 'Harborline Real Estate', sector: 'Real_Estate', isUnlocked: false, unlockNetWorthRequired: 1000000, isAcquired: false, acquisitionCost: 250000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 82, hourlyNetProfit: 0, branchCount: 1, staffCount: 8, managerHired: false, upgradeLevel: 0, reputation: 70, customerSatisfaction: 78, contractSecondsRemaining: 14400, contractReward: 5000, activeEvent: 'None' },
  { id: 'brightgrid-energy', name: 'SunPeak Energy', sector: 'Energy', isUnlocked: false, unlockNetWorthRequired: 2500000, isAcquired: false, acquisitionCost: 650000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 78, hourlyNetProfit: 0, branchCount: 1, staffCount: 16, managerHired: false, upgradeLevel: 0, reputation: 66, customerSatisfaction: 74, contractSecondsRemaining: 21600, contractReward: 10000, activeEvent: 'None' },
  { id: 'northstar-pharma', name: 'Northstar Pharma', sector: 'Pharma', isUnlocked: false, unlockNetWorthRequired: 5000000, isAcquired: false, acquisitionCost: 1500000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 75, hourlyNetProfit: 0, branchCount: 1, staffCount: 28, managerHired: false, upgradeLevel: 0, reputation: 62, customerSatisfaction: 72, contractSecondsRemaining: 28800, contractReward: 20000, activeEvent: 'None' },
  { id: 'signal-media', name: 'Signal Media Network', sector: 'Media', isUnlocked: false, unlockNetWorthRequired: 10000000, isAcquired: false, acquisitionCost: 3000000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 72, hourlyNetProfit: 0, branchCount: 1, staffCount: 34, managerHired: false, upgradeLevel: 0, reputation: 58, customerSatisfaction: 70, contractSecondsRemaining: 43200, contractReward: 30000, activeEvent: 'None' },
  { id: 'summit-sports', name: 'Summit Sports Group', sector: 'Sports', isUnlocked: false, unlockNetWorthRequired: 20000000, isAcquired: false, acquisitionCost: 7000000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 69, hourlyNetProfit: 0, branchCount: 1, staffCount: 45, managerHired: false, upgradeLevel: 0, reputation: 55, customerSatisfaction: 68, contractSecondsRemaining: 64800, contractReward: 50000, activeEvent: 'None' },
  { id: 'atlas-air', name: 'Atlas Air Holdings', sector: 'Airline', isUnlocked: false, unlockNetWorthRequired: 50000000, isAcquired: false, acquisitionCost: 18000000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 64, hourlyNetProfit: 0, branchCount: 1, staffCount: 80, managerHired: false, upgradeLevel: 0, reputation: 50, customerSatisfaction: 64, contractSecondsRemaining: 5400, contractReward: 600000, activeEvent: 'None' },
];
const retailUnits = { Discount: 10, Standard: 5, Luxury: 2 } as const;
const retailPrices = { Discount: 2.8, Standard: 3.8, Luxury: 6.5 } as const;

const expansionProfiles: Record<ExpansionSector, { baseHourly: number; event: string; eventMultiplier: number; contractSeconds: number }> = {
  Real_Estate: { baseHourly: 500, event: 'RENTAL DEMAND SURGE', eventMultiplier: 1.25, contractSeconds: 14400 },
  Energy: { baseHourly: 1200, event: 'GRID DEMAND SPIKE', eventMultiplier: 1.3, contractSeconds: 21600 },
  Pharma: { baseHourly: 2500, event: 'BREAKTHROUGH TRIAL', eventMultiplier: 1.45, contractSeconds: 28800 },
  Media: { baseHourly: 4000, event: 'VIRAL DISTRIBUTION', eventMultiplier: 1.5, contractSeconds: 43200 },
  Sports: { baseHourly: 7500, event: 'CHAMPIONSHIP RUN', eventMultiplier: 1.6, contractSeconds: 64800 },
  Airline: { baseHourly: 15000, event: 'HOLIDAY TRAVEL RUSH', eventMultiplier: 1.35, contractSeconds: 86400 },
};

function applySynergy<T extends BusinessEntity>(result: { business: T; cashDelta: number }, acquiredCount: number): { business: T; cashDelta: number } { const multiplier = 1 + Math.min(0.2, Math.max(0, acquiredCount - 1) * 0.04); return { business: { ...result.business, hourlyNetProfit: Number((result.business.hourlyNetProfit * multiplier).toFixed(2)) }, cashDelta: Number((result.cashDelta * multiplier).toFixed(2)) }; }

function expansionTick(business: ExpansionData, seconds: number, events: string[]): { business: ExpansionData; cashDelta: number } {
  if (!business.isAcquired) return { business: { ...business, hourlyNetProfit: 0 }, cashDelta: 0 };
  const profile = expansionProfiles[business.sector];
  const eventActive = business.activeEvent !== 'None';
  const serviceQuality = Math.max(0.45, Math.min(1.2, (business.reputation / 100) * (business.customerSatisfaction / 100)));
  const managerBoost = business.managerHired ? 1.15 : 1;
  const upgradeBoost = 1 + business.upgradeLevel * 0.18;
  const eventBoost = eventActive ? profile.eventMultiplier : 1;
  const hourly = profile.baseHourly * Math.max(1, business.branchCount) * managerBoost * upgradeBoost * serviceQuality * eventBoost;
  const operatingDelta = Number((hourly * seconds / 3600).toFixed(2));
  const remaining = Math.max(0, business.contractSecondsRemaining - seconds);
  const contractComplete = remaining === 0;
  const nextEvent = eventActive ? 'None' : Math.random() < 0.012 ? profile.event : 'None';
  if (nextEvent !== 'None') events.push(`${business.name}: ${nextEvent} · customer demand is surging.`);
  if (contractComplete) events.push(`${business.name}: customer contract completed · ${business.contractReward.toLocaleString()} bonus deposited.`);
  return { business: { ...business, hourlyNetProfit: Number(hourly.toFixed(2)), contractSecondsRemaining: contractComplete ? profile.contractSeconds : remaining, activeEvent: nextEvent, reputation: Math.max(0, Math.min(100, business.reputation + (business.managerHired ? 0.02 : -0.01) * seconds)), customerSatisfaction: Math.max(0, Math.min(100, business.customerSatisfaction + (business.staffCount >= business.branchCount * 12 ? 0.015 : -0.02) * seconds)) }, cashDelta: Number((operatingDelta + (contractComplete ? business.contractReward : 0)).toFixed(2)) };
}


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
  return { business: { ...business, stockUnits: business.stockUnits - unitsDeducted, onboardingStep: business.onboardingStep === 'WATCH_FIRST_SALE' && unitsDeducted > 0 ? 'COMPLETE' : business.onboardingStep, hourlyNetProfit, policeHeat: business.legalStatus === 'Shadow_Underground' ? Math.min(100, business.policeHeat + 0.02) : 0 }, cashDelta: netCashDelta };
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
  const acquiredCount = businesses.filter(item => item.isAcquired).length; const next = businesses.map(item => { if (item.sector === 'Retail') { const result = applySynergy(retailTick(item, seconds, events), acquiredCount); cashDelta += result.cashDelta; return result.business; } if (item.sector === 'Mobility') { const result = applySynergy(mobilityTick(item, seconds), acquiredCount); cashDelta += result.cashDelta; return result.business; } if (item.sector === 'Tech_SaaS') { const result = applySynergy(saasTick(item, seconds, events), acquiredCount); cashDelta += result.cashDelta; return result.business; } if (item.sector === 'Construction_Mega') { const result = applySynergy(constructionTick(item, constructionElapsedSeconds, events), acquiredCount); cashDelta += result.cashDelta; return result.business; } const result = applySynergy(expansionTick(item, seconds, events), acquiredCount); cashDelta += result.cashDelta; return result.business; });
  return { businesses: next, cashDelta: Number(cashDelta.toFixed(2)), events };
}

export async function loadBusinessSimulation(): Promise<BusinessEntity[]> { try { const raw = await AsyncStorage.getItem(BUSINESS_SIMULATION_SAVE); if (!raw) { await AsyncStorage.setItem(BUSINESS_SIMULATION_SAVE, JSON.stringify(DEFAULT_BUSINESSES)); return DEFAULT_BUSINESSES; } const parsed = JSON.parse(raw); const businesses = Array.isArray(parsed) ? parsed : parsed && Array.isArray(parsed.businesses) ? parsed.businesses : null; const valid = Array.isArray(businesses) && businesses.length > 0 && businesses.every(item => item && typeof item.id === 'string' && typeof item.name === 'string' && ['Retail', 'Mobility', 'Tech_SaaS', 'Construction_Mega', 'Real_Estate', 'Energy', 'Pharma', 'Media', 'Sports', 'Airline'].includes(item.sector) && typeof item.isAcquired === 'boolean'); if (!valid) throw new Error('Invalid business save'); const existing = new Set(businesses.map(item => item.id)); return [...(businesses as BusinessEntity[]), ...DEFAULT_BUSINESSES.filter(item => !existing.has(item.id))]; } catch { await AsyncStorage.setItem(BUSINESS_SIMULATION_SAVE, JSON.stringify(DEFAULT_BUSINESSES)); return DEFAULT_BUSINESSES; } }
export async function persistBusinessSimulation(businesses: BusinessEntity[]) { await AsyncStorage.setItem(BUSINESS_SIMULATION_SAVE, JSON.stringify({ schemaVersion: BUSINESS_SIMULATION_SAVE_VERSION, businesses })); }
