import AsyncStorage from '@react-native-async-storage/async-storage';
import { BusinessEntity, ConstructionData, ExpansionData, ExpansionSector, MobilityData, RetailData, SaaSData } from '../types/business';
import { passiveIncomeMultiplier } from './economyPlan';

export const BUSINESS_SIMULATION_SAVE = 'empire-rush-unified-businesses-v2';
export const BUSINESS_SIMULATION_SAVE_VERSION = 3;
export { passiveIncomeMultiplier } from './economyPlan';
export const DEFAULT_BUSINESSES: BusinessEntity[] = [
  { id: 'apex-retail', name: 'Copper & Bloom Market', sector: 'Retail', isUnlocked: true, unlockNetWorthRequired: 0, isAcquired: false, acquisitionCost: 500, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 92, hourlyNetProfit: 0, stockUnits: 0, maxStockCapacity: 2500, pricingTier: 'Standard', hasSecurity: false, hasManager: false, onboardingStep: 'ORDER_STOCK', unitWholesaleCost: 2, monthlyRent: 800, monthlyPayroll: 1200, salesRemainder: 0, autoRestockEnabled: false, demandEvent: 'None', demandEventSeconds: 0, demandClockSeconds: 0, pulseChain: 0, lastSaleSequence: 0, lastSaleRevenue: 0 },
  { id: 'metro-mobility', name: 'Neon Mile Fleet', sector: 'Mobility', isUnlocked: false, unlockNetWorthRequired: 15000, isAcquired: false, acquisitionCost: 12000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 90, hourlyNetProfit: 0, economySedans: 10, electricEVs: 0, luxuryLimos: 0, fleetHealth: 100, surgeActive: false },
  { id: 'cyberpulse-saas', name: 'SignalForge Cloud', sector: 'Tech_SaaS', isUnlocked: false, unlockNetWorthRequired: 75000, isAcquired: false, acquisitionCost: 60000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 88, hourlyNetProfit: 0, activeSubscribers: 20000, serverCapacity: 25000, openBugs: 0 },
  { id: 'titan-infrastructure', name: 'Ironline Civic Works', sector: 'Construction_Mega', isUnlocked: false, unlockNetWorthRequired: 250000, isAcquired: false, acquisitionCost: 180000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 85, hourlyNetProfit: 0, activeTenderName: null, projectPhase: 0, phaseProgressPercent: 0, projectEscrowPayout: 250000, machineryDispatched: false, safetyCleared: false },
  { id: 'harbor-estates', name: 'Harborlight Properties', sector: 'Real_Estate', isUnlocked: false, unlockNetWorthRequired: 750000, isAcquired: false, acquisitionCost: 550000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 82, hourlyNetProfit: 0, branchCount: 1, staffCount: 8, managerHired: false, upgradeLevel: 0, reputation: 70, customerSatisfaction: 78, contractSecondsRemaining: 14400, contractReward: 5000, activeEvent: 'None' },
  { id: 'brightgrid-energy', name: 'Sunward Gridworks', sector: 'Energy', isUnlocked: false, unlockNetWorthRequired: 2500000, isAcquired: false, acquisitionCost: 1800000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 78, hourlyNetProfit: 0, branchCount: 1, staffCount: 16, managerHired: false, upgradeLevel: 0, reputation: 66, customerSatisfaction: 74, contractSecondsRemaining: 21600, contractReward: 10000, activeEvent: 'None' },
  { id: 'northstar-pharma', name: 'Northstar Therapeutics', sector: 'Pharma', isUnlocked: false, unlockNetWorthRequired: 8000000, isAcquired: false, acquisitionCost: 5500000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 75, hourlyNetProfit: 0, branchCount: 1, staffCount: 28, managerHired: false, upgradeLevel: 0, reputation: 62, customerSatisfaction: 72, contractSecondsRemaining: 28800, contractReward: 20000, activeEvent: 'None' },
  { id: 'signal-media', name: 'Signal & Story Studios', sector: 'Media', isUnlocked: false, unlockNetWorthRequired: 25000000, isAcquired: false, acquisitionCost: 16000000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 72, hourlyNetProfit: 0, branchCount: 1, staffCount: 34, managerHired: false, upgradeLevel: 0, reputation: 58, customerSatisfaction: 70, contractSecondsRemaining: 43200, contractReward: 30000, activeEvent: 'None' },
  { id: 'summit-sports', name: 'Fastbreak Atlas', sector: 'Sports', isUnlocked: false, unlockNetWorthRequired: 80000000, isAcquired: false, acquisitionCost: 52000000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 69, hourlyNetProfit: 0, branchCount: 1, staffCount: 45, managerHired: false, upgradeLevel: 0, reputation: 55, customerSatisfaction: 68, contractSecondsRemaining: 64800, contractReward: 50000, activeEvent: 'None' },
  { id: 'atlas-air', name: 'BlueArc Air', sector: 'Airline', isUnlocked: false, unlockNetWorthRequired: 250000000, isAcquired: false, acquisitionCost: 160000000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 64, hourlyNetProfit: 0, branchCount: 1, staffCount: 80, managerHired: false, upgradeLevel: 0, reputation: 50, customerSatisfaction: 64, contractSecondsRemaining: 5400, contractReward: 600000, activeEvent: 'None' },
];
const retailUnits = { Discount: 4, Standard: 2, Luxury: 1 } as const;
const retailPrices = { Discount: 4, Standard: 5.5, Luxury: 8 } as const;

const expansionProfiles: Record<ExpansionSector, { baseHourly: number; event: string; eventMultiplier: number; contractSeconds: number }> = {
  Real_Estate: { baseHourly: 1200, event: 'RENTAL DEMAND SURGE', eventMultiplier: 1.25, contractSeconds: 14400 },
  Energy: { baseHourly: 2200, event: 'GRID DEMAND SPIKE', eventMultiplier: 1.3, contractSeconds: 21600 },
  Pharma: { baseHourly: 5500, event: 'BREAKTHROUGH TRIAL', eventMultiplier: 1.45, contractSeconds: 28800 },
  Media: { baseHourly: 11000, event: 'VIRAL DISTRIBUTION', eventMultiplier: 1.5, contractSeconds: 43200 },
  Sports: { baseHourly: 30000, event: 'CHAMPIONSHIP RUN', eventMultiplier: 1.6, contractSeconds: 64800 },
  Airline: { baseHourly: 55000, event: 'HOLIDAY TRAVEL RUSH', eventMultiplier: 1.35, contractSeconds: 86400 },
};

type OperationResult<T extends BusinessEntity> = { business: T; hourlyRate: number; pendingAmount?: number };

function applySynergy(result: OperationResult<BusinessEntity>, acquiredCount: number): OperationResult<BusinessEntity> {
  const multiplier = 1 + Math.min(0.2, Math.max(0, acquiredCount - 1) * 0.04);
  return {
    business: { ...result.business, hourlyNetProfit: Number((result.hourlyRate * multiplier).toFixed(2)) },
    hourlyRate: Number((result.hourlyRate * multiplier).toFixed(2)),
    pendingAmount: Number(((result.pendingAmount ?? 0) * multiplier).toFixed(2)),
  };
}

function expansionOperations(business: ExpansionData, seconds: number, events: string[]): OperationResult<ExpansionData> {
  if (!business.isAcquired) return { business: { ...business, hourlyNetProfit: 0 }, hourlyRate: 0 };
  const profile = expansionProfiles[business.sector];
  const eventActive = business.activeEvent !== 'None';
  const serviceQuality = Math.max(0.45, Math.min(1.2, (business.reputation / 100) * (business.customerSatisfaction / 100)));
  const managerBoost = business.managerHired ? 1.15 : 1;
  const upgradeBoost = 1 + business.upgradeLevel * 0.18;
  const eventBoost = eventActive ? profile.eventMultiplier : 1;
  const hourly = profile.baseHourly * Math.max(1, business.branchCount) * managerBoost * upgradeBoost * serviceQuality * eventBoost;
  const remaining = Math.max(0, business.contractSecondsRemaining - seconds);
  const contractComplete = remaining === 0;
  const nextEvent = eventActive ? 'None' : Math.random() < 0.012 ? profile.event : 'None';
  if (nextEvent !== 'None') events.push(`${business.name}: ${nextEvent} · customer demand is surging.`);
  if (contractComplete) events.push(`${business.name}: customer contract completed · bonus is queued for the next settlement.`);
  const nextBusiness = { ...business, hourlyNetProfit: Number(hourly.toFixed(2)), baseHourlyNetProfit: Number(hourly.toFixed(2)), contractSecondsRemaining: contractComplete ? profile.contractSeconds : remaining, activeEvent: nextEvent, reputation: Math.max(0, Math.min(100, business.reputation + (business.managerHired ? 0.02 : -0.01) * seconds)), customerSatisfaction: Math.max(0, Math.min(100, business.customerSatisfaction + (business.staffCount >= business.branchCount * 12 ? 0.015 : -0.02) * seconds)) };
  return { business: nextBusiness, hourlyRate: Number(hourly.toFixed(2)) };
}

function retailOperations(business: RetailData, seconds: number, events: string[], liquidCash: number): OperationResult<RetailData> {
  if (!business.isAcquired) return { business: { ...business, hourlyNetProfit: 0 }, hourlyRate: 0 };
  const modeMultiplier = business.pricingTier === 'Discount' ? 1.55 : business.pricingTier === 'Luxury' ? 0.55 : 1;
  const event = business.demandEvent && business.demandEventSeconds && business.demandEventSeconds > 0 ? business.demandEvent : 'None';
  const eventMultiplier = event === 'Morning Rush' ? 1.8 : event === 'Viral Drop' ? 2.4 : event === 'Rain Delay' ? 0.7 : 1;
  const unitsPerHour = retailUnits[business.pricingTier] * 1800 * modeMultiplier * eventMultiplier;
  const price = retailPrices[business.pricingTier];
  const revenuePerHour = unitsPerHour * price;
  const cogsPerHour = unitsPerHour * (business.unitWholesaleCost ?? 2);
  const fixedCostsPerHour = ((business.monthlyRent ?? 800) + (business.monthlyPayroll ?? 1200)) / (30 * 24);
  const taxPerHour = business.legalStatus === 'Licensed_Legal' ? revenuePerHour * 0.15 : 0;
  const declaredHourlyRate = business.stockUnits > 0 ? Math.max(0, revenuePerHour - cogsPerHour - fixedCostsPerHour - taxPerHour) : 0;
  const priorRemainder = business.salesRemainder ?? 0;
  const desiredUnits = unitsPerHour * seconds / 3600 + priorRemainder;
  const unitsDeducted = Math.min(business.stockUnits, Math.max(0, Math.floor(desiredUnits)));
  const salesRemainder = Math.max(0, desiredUnits - unitsDeducted);
  const revenueEarned = Number((unitsDeducted * price).toFixed(2));
  const nextDemandClock = (business.demandClockSeconds ?? 0) + seconds;
  const eventRemaining = Math.max(0, (business.demandEventSeconds ?? 0) - seconds);
  const shouldStartPulse = eventRemaining === 0 && nextDemandClock >= 60;
  const pulse = shouldStartPulse ? (business.pulseChain ?? 0) + 1 : (business.pulseChain ?? 0);
  const nextEvent = shouldStartPulse ? (['Morning Rush', 'Viral Drop', 'Rain Delay'] as const)[pulse % 3] : event;
  const nextEventSeconds = shouldStartPulse ? 60 : eventRemaining;
  if (shouldStartPulse) events.push(`${business.name}: ${nextEvent} demand pulse activated.`);
  if (business.stockUnits > 0 && business.stockUnits - unitsDeducted === 0) events.push(`${business.name}: shelves empty; sales paused without operating-cost bleed.`);
  const sequence = (business.lastSaleSequence ?? 0) + (unitsDeducted > 0 ? 1 : 0);
  const nextBusiness = { ...business, stockUnits: business.stockUnits - unitsDeducted, baseHourlyNetProfit: Number(declaredHourlyRate.toFixed(2)), onboardingStep: business.onboardingStep === 'WATCH_FIRST_SALE' && unitsDeducted > 0 ? 'COMPLETE' : business.onboardingStep, unitWholesaleCost: business.unitWholesaleCost ?? 2, hourlyNetProfit: Number(declaredHourlyRate.toFixed(2)), salesRemainder, demandEvent: nextEvent, demandEventSeconds: nextEventSeconds, demandClockSeconds: shouldStartPulse ? 0 : nextDemandClock, pulseChain: pulse, lastSaleSequence: sequence, lastSaleRevenue: revenueEarned, policeHeat: business.legalStatus === 'Shadow_Underground' ? Math.min(100, business.policeHeat + 0.02) : 0 };
  const taxPerUnit = business.legalStatus === 'Licensed_Legal' ? price * 0.15 : 0;
  const netSaleAmount = unitsDeducted * (price - (business.unitWholesaleCost ?? 2) - taxPerUnit);
  const fixedCostForPeriod = business.stockUnits > 0 ? fixedCostsPerHour * seconds / 3600 : 0;
  return { business: nextBusiness, hourlyRate: Number(declaredHourlyRate.toFixed(2)), pendingAmount: Math.max(0, netSaleAmount - fixedCostForPeriod) };
}

function mobilityOperations(business: MobilityData, seconds: number): OperationResult<MobilityData> {
  if (!business.isAcquired) return { business: { ...business, hourlyNetProfit: 0 }, hourlyRate: 0 };
  const baseHourly = business.economySedans * 2200 + business.electricEVs * 6000 + business.luxuryLimos * 12000;
  const surged = business.surgeActive ? baseHourly * 1.7 : baseHourly;
  const adjusted = business.fleetHealth < 30 ? surged * 0.5 : surged;
  const hourlyRate = Number(adjusted.toFixed(2));
  return { business: { ...business, fleetHealth: Math.max(0, Number((business.fleetHealth - 0.05 * seconds / 2).toFixed(2))), hourlyNetProfit: hourlyRate, baseHourlyNetProfit: hourlyRate }, hourlyRate, pendingAmount: adjusted * seconds / 3600 };
}

function saasOperations(business: SaaSData, seconds: number, events: string[]): OperationResult<SaaSData> {
  if (!business.isAcquired) return { business: { ...business, hourlyNetProfit: 0 }, hourlyRate: 0 };
  let subscribers = business.activeSubscribers;
  if (subscribers > business.serverCapacity) { subscribers = Math.floor(subscribers * 0.95); events.push(`${business.name}: SERVER OVERLOAD · 5% subscriber churn.`); }
  const hourlyRate = Number((subscribers * 3.5).toFixed(2));
  return { business: { ...business, activeSubscribers: subscribers, hourlyNetProfit: hourlyRate, baseHourlyNetProfit: hourlyRate }, hourlyRate, pendingAmount: hourlyRate * seconds / 3600 };
}

function constructionOperations(business: ConstructionData, elapsedSeconds: number, events: string[]): OperationResult<ConstructionData> {
  if (!business.isAcquired) return { business: { ...business, hourlyNetProfit: 0 }, hourlyRate: 0 };
  if (!business.activeTenderName || business.projectPhase === 0) return { business: { ...business, hourlyNetProfit: 250000, baseHourlyNetProfit: 250000 }, hourlyRate: 250000 };
  let next = { ...business }; let progress = next.phaseProgressPercent;
  if (elapsedSeconds >= 3) progress += 1;
  if (progress >= 100) { if (next.projectPhase < 3) { next = { ...next, projectPhase: (next.projectPhase + 1) as ConstructionData['projectPhase'], phaseProgressPercent: 0 }; events.push(`${next.name}: advanced to construction phase ${next.projectPhase}.`); } else { events.push(`${next.name}: tender complete; settlement bonus is queued.`); next = { ...next, activeTenderName: null, projectPhase: 0, phaseProgressPercent: 0, machineryDispatched: false, safetyCleared: false }; } } else next = { ...next, phaseProgressPercent: progress };
  const hourlyRate = next.activeTenderName ? 0 : 250000;
  return { business: { ...next, baseHourlyNetProfit: hourlyRate, hourlyNetProfit: hourlyRate }, hourlyRate, pendingAmount: hourlyRate * elapsedSeconds / 3600 };
}

export type SimulationResult = { businesses: BusinessEntity[]; events: string[]; hourlyByBusiness: Record<string, number> };

export function simulateBusinessOperations(businesses: BusinessEntity[], seconds = 2, constructionElapsedSeconds = seconds, liquidCash = Number.MAX_SAFE_INTEGER, ownershipFractions: Record<string, number> = {}, playerNetWorth = 0): SimulationResult {
  const events: string[] = []; const hourlyByBusiness: Record<string, number> = {};
  const acquiredCount = businesses.filter(item => item.isAcquired).length;
  const wealthMultiplier = passiveIncomeMultiplier(playerNetWorth);
  const next = businesses.map(item => {
    const operation = item.sector === 'Retail' ? retailOperations(item, seconds, events, liquidCash) : item.sector === 'Mobility' ? mobilityOperations(item, seconds) : item.sector === 'Tech_SaaS' ? saasOperations(item, seconds, events) : item.sector === 'Construction_Mega' ? constructionOperations(item, constructionElapsedSeconds, events) : expansionOperations(item, seconds, events);
    const synergized = applySynergy(operation, acquiredCount);
    const founderShare = Math.min(1, Math.max(0, Number(ownershipFractions[item.id] ?? 1)));
    const rampMultiplier = item.isAcquired && Number.isFinite(item.operatingRampSeconds) ? Math.min(1, Math.max(0.02, (Number(item.operatingRampSeconds) + seconds) / (4 * 3600))) : 1;
    const declaredHourlyRate = Number((synergized.hourlyRate * rampMultiplier * founderShare * wealthMultiplier).toFixed(2));
    const pendingAmount = Number(((item.pendingSettlementAmount ?? 0) + (synergized.pendingAmount ?? 0) * rampMultiplier * founderShare * wealthMultiplier).toFixed(2));
    hourlyByBusiness[item.id] = declaredHourlyRate;
    return { ...synergized.business, operatingRampSeconds: item.isAcquired && Number.isFinite(item.operatingRampSeconds) ? Math.min(4 * 3600, Number(item.operatingRampSeconds) + seconds) : synergized.business.operatingRampSeconds, baseHourlyNetProfit: Number((synergized.business.baseHourlyNetProfit ?? synergized.business.hourlyNetProfit).toFixed(2)), hourlyNetProfit: declaredHourlyRate, pendingSettlementAmount: pendingAmount, settlementAccruedSeconds: (item.settlementAccruedSeconds ?? 0) + (item.isAcquired ? seconds : 0) };
  });
  return { businesses: next, events, hourlyByBusiness };
}

const normalizeBusinessNames = (businesses: BusinessEntity[]): BusinessEntity[] => businesses.map(item => { const baseline = DEFAULT_BUSINESSES.find(candidate => candidate.id === item.id); const merged = baseline ? { ...baseline, ...item, unlockNetWorthRequired: baseline.unlockNetWorthRequired, acquisitionCost: baseline.acquisitionCost } : item; return merged.id === 'brightgrid-energy' || (merged.sector === 'Energy' && ['BrightGrid Energy', 'Surya Energy'].includes(merged.name)) ? { ...merged, name: 'Sunward Gridworks' } : merged; });
export async function loadBusinessSimulation(): Promise<BusinessEntity[]> { try { const raw = await AsyncStorage.getItem(BUSINESS_SIMULATION_SAVE); if (!raw) { await AsyncStorage.setItem(BUSINESS_SIMULATION_SAVE, JSON.stringify(DEFAULT_BUSINESSES)); return DEFAULT_BUSINESSES; } const parsed = JSON.parse(raw); const businesses = Array.isArray(parsed) ? parsed : parsed && Array.isArray(parsed.businesses) ? parsed.businesses : null; const valid = Array.isArray(businesses) && businesses.length > 0 && businesses.every(item => item && typeof item.id === 'string' && typeof item.name === 'string' && ['Retail', 'Mobility', 'Tech_SaaS', 'Construction_Mega', 'Real_Estate', 'Energy', 'Pharma', 'Media', 'Sports', 'Airline'].includes(item.sector) && typeof item.isAcquired === 'boolean'); if (!valid) throw new Error('Invalid business save'); const existing = new Set(businesses.map(item => item.id)); return normalizeBusinessNames([...(businesses as BusinessEntity[]), ...DEFAULT_BUSINESSES.filter(item => !existing.has(item.id))]); } catch { await AsyncStorage.setItem(BUSINESS_SIMULATION_SAVE, JSON.stringify(DEFAULT_BUSINESSES)); return DEFAULT_BUSINESSES; } }
export async function persistBusinessSimulation(businesses: BusinessEntity[]) { await AsyncStorage.setItem(BUSINESS_SIMULATION_SAVE, JSON.stringify({ schemaVersion: BUSINESS_SIMULATION_SAVE_VERSION, businesses })); }
