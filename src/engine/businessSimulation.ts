import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BusinessEntity,
  ConstructionData,
  ExpansionData,
  ExpansionSector,
  MobilityData,
  RetailData,
  SaaSData,
} from "../types/business";
import { passiveIncomeMultiplier } from "./economyPlan";
import { GAME_DAYS_PER_MONTH } from "./gameCalendar";
import {
  businessUnitsOrAssets,
  normalizeBusinessLevel,
} from "./businessLevels";
import {
  advanceConstruction,
  constructionHourlyProfit,
} from "./constructionCompanyEngine";
import { advanceITCompany, DEFAULT_IT_SOFTWARE_STATE } from "./itCompanyEngine";
import { advanceBankingCompany, DEFAULT_BANKING_COMPANY_STATE } from "./bankingCompanyEngine";
import { coordinatedWrite } from "./saveCoordinator";
import {
  BUSINESS_SIMULATION_BACKUP,
  BUSINESS_SIMULATION_SAVE,
  GAME_SAVE_STORAGE_KEY,
} from "./saveKeys";

export const BUSINESS_SIMULATION_SAVE_VERSION = 4;
export { passiveIncomeMultiplier } from "./economyPlan";
export const DEFAULT_BUSINESSES: BusinessEntity[] = [
  {
    id: "apex-retail",
    name: "Copper & Bloom Market",
    sector: "Retail",
    isUnlocked: true,
    unlockNetWorthRequired: 0,
    isAcquired: false,
    acquisitionCost: 500,
    legalStatus: "Licensed_Legal",
    policeHeat: 0,
    stability: 92,
    hourlyNetProfit: 0,
    stockUnits: 0,
    maxStockCapacity: 2500,
    pricingTier: "Standard",
    hasSecurity: false,
    hasManager: false,
    onboardingStep: "ORDER_STOCK",
    unitWholesaleCost: 2,
    monthlyRent: 800,
    monthlyPayroll: 1200,
    salesRemainder: 0,
    autoRestockEnabled: false,
    demandEvent: "None",
    demandEventSeconds: 0,
    demandClockSeconds: 0,
    pulseChain: 0,
    lastSaleSequence: 0,
    lastSaleRevenue: 0,
  },
  {
    id: "metro-mobility",
    name: "Neon Mile Fleet",
    sector: "Mobility",
    isUnlocked: false,
    unlockNetWorthRequired: 15000,
    isAcquired: false,
    acquisitionCost: 12000,
    legalStatus: "Licensed_Legal",
    policeHeat: 0,
    stability: 90,
    hourlyNetProfit: 0,
    economySedans: 10,
    electricEVs: 0,
    luxuryLimos: 0,
    fleetHealth: 100,
    surgeActive: false,
  },
  {
    id: "cyberpulse-saas",
    name: "IT & Software Company",
    sector: "Tech_SaaS",
    isUnlocked: false,
    unlockNetWorthRequired: 75000,
    isAcquired: false,
    acquisitionCost: 60000,
    legalStatus: "Licensed_Legal",
    policeHeat: 0,
    stability: 88,
    hourlyNetProfit: 0,
    ...DEFAULT_IT_SOFTWARE_STATE,
    activeSubscribers: 20000,
    serverCapacity: 25000,
    openBugs: 0,
  },
  {
    id: "titan-infrastructure",
    name: "Construction Company",
    sector: "Construction_Mega",
    isUnlocked: false,
    unlockNetWorthRequired: 250000,
    isAcquired: false,
    acquisitionCost: 180000,
    legalStatus: "Licensed_Legal",
    policeHeat: 0,
    stability: 85,
    hourlyNetProfit: 0,
    activeTenderName: null,
    projectPhase: 0,
    phaseProgressPercent: 0,
    projectEscrowPayout: 250000,
    machineryDispatched: false,
    safetyCleared: false,
    constructionStage: "Small contractor",
    landOwned: 0,
    landCapacity: 1,
    selectedMarket: "Residential",
    machinery: { excavators: 0, cranes: 0, mixers: 0, dumpTrucks: 0 },
    materialsStock: 0,
    workers: 4,
    activeProjectId: null,
    projectBudget: 0,
    projectCostSpent: 0,
    projectDeadlineSeconds: 0,
    projectDurationSeconds: 0,
    projectsCompleted: 0,
    activeContractType: null,
    activeContractName: null,
    contractPayout: 0,
    contractDeadlineSeconds: 0,
    contractReputation: 0,
  },
  {
    id: "blueharbor-banking",
    name: "Banking Company",
    sector: "Banking",
    isUnlocked: false,
    unlockNetWorthRequired: 1_500_000,
    isAcquired: false,
    acquisitionCost: 1_000_000,
    legalStatus: "Licensed_Legal",
    policeHeat: 0,
    stability: 88,
    ...DEFAULT_BANKING_COMPANY_STATE,
    hourlyNetProfit: 0,
  },
  {
    id: "harbor-estates",
    name: "Harborlight Properties",
    sector: "Real_Estate",
    isUnlocked: false,
    unlockNetWorthRequired: 750000,
    isAcquired: false,
    acquisitionCost: 550000,
    legalStatus: "Licensed_Legal",
    policeHeat: 0,
    stability: 82,
    hourlyNetProfit: 0,
    branchCount: 1,
    staffCount: 8,
    managerHired: false,
    upgradeLevel: 0,
    reputation: 70,
    customerSatisfaction: 78,
    contractSecondsRemaining: 14400,
    contractReward: 5000,
    activeEvent: "None",
  },
  {
    id: "brightgrid-energy",
    name: "Sunward Gridworks",
    sector: "Energy",
    isUnlocked: false,
    unlockNetWorthRequired: 2500000,
    isAcquired: false,
    acquisitionCost: 1800000,
    legalStatus: "Licensed_Legal",
    policeHeat: 0,
    stability: 78,
    hourlyNetProfit: 0,
    branchCount: 1,
    staffCount: 16,
    managerHired: false,
    upgradeLevel: 0,
    reputation: 66,
    customerSatisfaction: 74,
    contractSecondsRemaining: 21600,
    contractReward: 10000,
    activeEvent: "None",
  },
  {
    id: "northstar-pharma",
    name: "Northstar Therapeutics",
    sector: "Pharma",
    isUnlocked: false,
    unlockNetWorthRequired: 8000000,
    isAcquired: false,
    acquisitionCost: 5500000,
    legalStatus: "Licensed_Legal",
    policeHeat: 0,
    stability: 75,
    hourlyNetProfit: 0,
    branchCount: 1,
    staffCount: 28,
    managerHired: false,
    upgradeLevel: 0,
    reputation: 62,
    customerSatisfaction: 72,
    contractSecondsRemaining: 28800,
    contractReward: 20000,
    activeEvent: "None",
  },
  {
    id: "signal-media",
    name: "Signal & Story Studios",
    sector: "Media",
    isUnlocked: false,
    unlockNetWorthRequired: 25000000,
    isAcquired: false,
    acquisitionCost: 16000000,
    legalStatus: "Licensed_Legal",
    policeHeat: 0,
    stability: 72,
    hourlyNetProfit: 0,
    branchCount: 1,
    staffCount: 34,
    managerHired: false,
    upgradeLevel: 0,
    reputation: 58,
    customerSatisfaction: 70,
    contractSecondsRemaining: 43200,
    contractReward: 30000,
    activeEvent: "None",
  },
  {
    id: "summit-sports",
    name: "Fastbreak Atlas",
    sector: "Sports",
    isUnlocked: false,
    unlockNetWorthRequired: 80000000,
    isAcquired: false,
    acquisitionCost: 52000000,
    legalStatus: "Licensed_Legal",
    policeHeat: 0,
    stability: 69,
    hourlyNetProfit: 0,
    branchCount: 1,
    staffCount: 45,
    managerHired: false,
    upgradeLevel: 0,
    reputation: 55,
    customerSatisfaction: 68,
    contractSecondsRemaining: 64800,
    contractReward: 50000,
    activeEvent: "None",
  },
  {
    id: "atlas-air",
    name: "BlueArc Air",
    sector: "Airline",
    isUnlocked: false,
    unlockNetWorthRequired: 250000000,
    isAcquired: false,
    acquisitionCost: 160000000,
    legalStatus: "Licensed_Legal",
    policeHeat: 0,
    stability: 64,
    hourlyNetProfit: 0,
    branchCount: 1,
    staffCount: 80,
    managerHired: false,
    upgradeLevel: 0,
    reputation: 50,
    customerSatisfaction: 64,
    contractSecondsRemaining: 5400,
    contractReward: 600000,
    activeEvent: "None",
  },
];
const retailUnits = { Discount: 4, Standard: 2, Luxury: 1 } as const;
const retailPrices = { Discount: 4, Standard: 5.5, Luxury: 8 } as const;

export type RetailHourlyProjection = {
  unitsPerHour: number;
  revenue: number;
  expenses: number;
  net: number;
};

export function retailHourlyProjection(business: RetailData): RetailHourlyProjection {
  if (!business.isAcquired || business.stockUnits <= 0)
    return { unitsPerHour: 0, revenue: 0, expenses: 0, net: 0 };
  const modeMultiplier =
    business.pricingTier === "Discount" ? 1.55 : business.pricingTier === "Luxury" ? 0.55 : 1;
  const event = (business.demandEventSeconds ?? 0) > 0 ? business.demandEvent : "None";
  const eventMultiplier =
    event === "Morning Rush" ? 1.8 : event === "Viral Drop" ? 2.4 : event === "Rain Delay" ? 0.7 : 1;
  const unitsPerHour = retailUnits[business.pricingTier] * 1800 * modeMultiplier * eventMultiplier;
  const price = retailPrices[business.pricingTier];
  const revenue = unitsPerHour * price;
  const cogs = unitsPerHour * (business.unitWholesaleCost ?? 2);
  const fixed = ((business.monthlyRent ?? 800) + (business.monthlyPayroll ?? 1200)) / GAME_DAYS_PER_MONTH;
  const tax = business.legalStatus === "Licensed_Legal" ? revenue * 0.15 : 0;
  const expenses = cogs + fixed + tax;
  return { unitsPerHour, revenue, expenses, net: Math.max(0, revenue - expenses) };
}

const expansionProfiles: Record<
  ExpansionSector,
  {
    baseHourly: number;
    event: string;
    eventMultiplier: number;
    contractSeconds: number;
  }
> = {
  Real_Estate: {
    baseHourly: 1200,
    event: "RENTAL DEMAND SURGE",
    eventMultiplier: 1.25,
    contractSeconds: 14400,
  },
  Energy: {
    baseHourly: 2200,
    event: "GRID DEMAND SPIKE",
    eventMultiplier: 1.3,
    contractSeconds: 21600,
  },
  Pharma: {
    baseHourly: 5500,
    event: "BREAKTHROUGH TRIAL",
    eventMultiplier: 1.45,
    contractSeconds: 28800,
  },
  Media: {
    baseHourly: 11000,
    event: "VIRAL DISTRIBUTION",
    eventMultiplier: 1.5,
    contractSeconds: 43200,
  },
  Sports: {
    baseHourly: 30000,
    event: "CHAMPIONSHIP RUN",
    eventMultiplier: 1.6,
    contractSeconds: 64800,
  },
  Airline: {
    baseHourly: 55000,
    event: "HOLIDAY TRAVEL RUSH",
    eventMultiplier: 1.35,
    contractSeconds: 86400,
  },
};

type OperationResult<T extends BusinessEntity> = {
  business: T;
  hourlyRate: number;
  pendingAmount?: number;
};

function applySynergy(
  result: OperationResult<BusinessEntity>,
  acquiredCount: number,
): OperationResult<BusinessEntity> {
  const multiplier = 1 + Math.min(0.2, Math.max(0, acquiredCount - 1) * 0.04);
  return {
    business: {
      ...result.business,
      hourlyNetProfit: Number((result.hourlyRate * multiplier).toFixed(2)),
    },
    hourlyRate: Number((result.hourlyRate * multiplier).toFixed(2)),
    pendingAmount: Number(
      ((result.pendingAmount ?? 0) * multiplier).toFixed(2),
    ),
  };
}

function expansionOperations(
  business: ExpansionData,
  seconds: number,
  events: string[],
): OperationResult<ExpansionData> {
  if (!business.isAcquired)
    return { business: { ...business, hourlyNetProfit: 0 }, hourlyRate: 0 };
  const profile = expansionProfiles[business.sector];
  const eventActive = business.activeEvent !== "None";
  const serviceQuality = Math.max(
    0.45,
    Math.min(
      1.2,
      (business.reputation / 100) * (business.customerSatisfaction / 100),
    ),
  );
  const managerBoost = business.managerHired ? 1.15 : 1;
  const upgradeBoost = 1 + business.upgradeLevel * 0.18;
  const eventBoost = eventActive ? profile.eventMultiplier : 1;
  const hourly =
    profile.baseHourly *
    Math.max(1, business.branchCount) *
    managerBoost *
    upgradeBoost *
    serviceQuality *
    eventBoost;
  const remaining = Math.max(0, business.contractSecondsRemaining - seconds);
  const contractComplete = remaining === 0;
  const nextEvent = eventActive
    ? "None"
    : Math.random() < 0.012
      ? profile.event
      : "None";
  if (nextEvent !== "None")
    events.push(`${business.name}: ${nextEvent} · customer demand is surging.`);
  if (contractComplete)
    events.push(
      `${business.name}: customer contract completed · bonus is queued for the next settlement.`,
    );
  const nextBusiness = {
    ...business,
    hourlyNetProfit: Number(hourly.toFixed(2)),
    baseHourlyNetProfit: Number(hourly.toFixed(2)),
    contractSecondsRemaining: contractComplete
      ? profile.contractSeconds
      : remaining,
    activeEvent: nextEvent,
    reputation: Math.max(
      0,
      Math.min(
        100,
        business.reputation + (business.managerHired ? 0.02 : -0.01) * seconds,
      ),
    ),
    customerSatisfaction: Math.max(
      0,
      Math.min(
        100,
        business.customerSatisfaction +
          (business.staffCount >= business.branchCount * 12 ? 0.015 : -0.02) *
            seconds,
      ),
    ),
  };
  return { business: nextBusiness, hourlyRate: Number(hourly.toFixed(2)) };
}

function retailOperations(
  business: RetailData,
  seconds: number,
  events: string[],
  liquidCash: number,
): OperationResult<RetailData> {
  if (!business.isAcquired)
    return { business: { ...business, hourlyNetProfit: 0 }, hourlyRate: 0 };
  const projection = retailHourlyProjection(business);
  const event =
    business.demandEvent &&
    business.demandEventSeconds &&
    business.demandEventSeconds > 0
      ? business.demandEvent
      : "None";
  const unitsPerHour = projection.unitsPerHour;
  const price = retailPrices[business.pricingTier];
  const declaredHourlyRate = projection.net;
  const priorRemainder = business.salesRemainder ?? 0;
  const desiredUnits = (unitsPerHour * seconds) / 3600 + priorRemainder;
  const unitsDeducted = Math.min(
    business.stockUnits,
    Math.max(0, Math.floor(desiredUnits)),
  );
  const remainingStock = Math.max(0, business.stockUnits - unitsDeducted);
  const salesRemainder =
    remainingStock > 0 ? Math.max(0, desiredUnits - unitsDeducted) : 0;
  const revenueEarned = Number((unitsDeducted * price).toFixed(2));
  const nextDemandClock = (business.demandClockSeconds ?? 0) + seconds;
  const eventRemaining = Math.max(
    0,
    (business.demandEventSeconds ?? 0) - seconds,
  );
  const shouldStartPulse = eventRemaining === 0 && nextDemandClock >= 60;
  const pulse = shouldStartPulse
    ? (business.pulseChain ?? 0) + 1
    : (business.pulseChain ?? 0);
  const nextEvent = shouldStartPulse
    ? (["Morning Rush", "Viral Drop", "Rain Delay"] as const)[pulse % 3]
    : event;
  const nextEventSeconds = shouldStartPulse ? 60 : eventRemaining;
  if (shouldStartPulse)
    events.push(`${business.name}: ${nextEvent} demand pulse activated.`);
  if (business.stockUnits > 0 && business.stockUnits - unitsDeducted === 0)
    events.push(
      `${business.name}: shelves empty; sales paused without operating-cost bleed.`,
    );
  const sequence =
    (business.lastSaleSequence ?? 0) + (unitsDeducted > 0 ? 1 : 0);
  const nextBusiness = {
    ...business,
    stockUnits: business.stockUnits - unitsDeducted,
    baseHourlyNetProfit: Number(declaredHourlyRate.toFixed(2)),
    onboardingStep:
      business.onboardingStep === "WATCH_FIRST_SALE" && unitsDeducted > 0
        ? "COMPLETE"
        : business.onboardingStep,
    unitWholesaleCost: business.unitWholesaleCost ?? 2,
    hourlyNetProfit: Number(declaredHourlyRate.toFixed(2)),
    salesRemainder,
    demandEvent: nextEvent,
    demandEventSeconds: nextEventSeconds,
    demandClockSeconds: shouldStartPulse ? 0 : nextDemandClock,
    pulseChain: pulse,
    lastSaleSequence: sequence,
    lastSaleRevenue: revenueEarned,
    policeHeat:
      business.legalStatus === "Shadow_Underground"
        ? Math.min(100, business.policeHeat + 0.02)
        : 0,
  };
  const taxPerUnit =
    business.legalStatus === "Licensed_Legal" ? price * 0.15 : 0;
  const netSaleAmount =
    unitsDeducted * (price - taxPerUnit);
  const fixedCostForPeriod =
    business.stockUnits > 0 ? ((business.monthlyRent ?? 800) + (business.monthlyPayroll ?? 1200)) / GAME_DAYS_PER_MONTH * seconds / 3600 : 0;
  return {
    business: nextBusiness,
    hourlyRate: Number(declaredHourlyRate.toFixed(2)),
    pendingAmount: Math.max(0, netSaleAmount - fixedCostForPeriod),
  };
}

function mobilityOperations(
  business: MobilityData,
  seconds: number,
): OperationResult<MobilityData> {
  if (!business.isAcquired)
    return { business: { ...business, hourlyNetProfit: 0 }, hourlyRate: 0 };
  const baseHourly =
    business.economySedans * 2200 +
    business.electricEVs * 6000 +
    business.luxuryLimos * 12000;
  const surged = business.surgeActive ? baseHourly * 1.7 : baseHourly;
  const adjusted = business.fleetHealth < 30 ? surged * 0.5 : surged;
  const hourlyRate = Number(adjusted.toFixed(2));
  return {
    business: {
      ...business,
      fleetHealth: Math.max(
        0,
        Number((business.fleetHealth - (0.05 * seconds) / 2).toFixed(2)),
      ),
      hourlyNetProfit: hourlyRate,
      baseHourlyNetProfit: hourlyRate,
    },
    hourlyRate,
    pendingAmount: (adjusted * seconds) / 3600,
  };
}

function saasOperations(
  business: SaaSData,
  seconds: number,
  events: string[],
  playerNetWorth: number,
): OperationResult<SaaSData> {
  const result = advanceITCompany(business, seconds, playerNetWorth);
  events.push(...result.events);
  return {
    business: result.business,
    hourlyRate: result.hourlyRate,
    pendingAmount: result.pendingAmount + result.cashDelta,
  };
}

function constructionOperations(
  business: ConstructionData,
  elapsedSeconds: number,
  events: string[],
): OperationResult<ConstructionData> {
  if (!business.isAcquired)
    return { business: { ...business, hourlyNetProfit: 0 }, hourlyRate: 0 };
  const result = advanceConstruction(business, elapsedSeconds);
  events.push(...result.events);
  const hourlyRate = constructionHourlyProfit(result.business);
  return {
    business: {
      ...result.business,
      baseHourlyNetProfit: hourlyRate,
      hourlyNetProfit: hourlyRate,
    },
    hourlyRate,
    pendingAmount: (hourlyRate * elapsedSeconds) / 3600 + result.cashDelta,
  };
}

function bankingOperations(
  business: Extract<BusinessEntity, { sector: "Banking" }>,
  seconds: number,
  events: string[],
  playerNetWorth: number,
): OperationResult<Extract<BusinessEntity, { sector: "Banking" }>> {
  const result = advanceBankingCompany(business, seconds, playerNetWorth);
  events.push(...result.events);
  return {
    business: result.business,
    hourlyRate: result.hourlyRate,
    pendingAmount: result.pendingAmount,
  };
}

export type SimulationResult = {
  businesses: BusinessEntity[];
  events: string[];
  hourlyByBusiness: Record<string, number>;
};

export function simulateBusinessOperations(
  businesses: BusinessEntity[],
  seconds = 2,
  constructionElapsedSeconds = seconds,
  liquidCash = Number.MAX_SAFE_INTEGER,
  ownershipFractions: Record<string, number> = {},
  playerNetWorth = 0,
): SimulationResult {
  const events: string[] = [];
  const hourlyByBusiness: Record<string, number> = {};
  const acquiredCount = businesses.filter((item) => item.isAcquired).length;
  const wealthMultiplier = passiveIncomeMultiplier(playerNetWorth);
  const next = businesses.map((item) => {
    const operation =
      item.sector === "Retail"
        ? retailOperations(item, seconds, events, liquidCash)
        : item.sector === "Mobility"
          ? mobilityOperations(item, seconds)
          : item.sector === "Tech_SaaS"
            ? saasOperations(item, seconds, events, playerNetWorth)
            : item.sector === "Construction_Mega"
              ? constructionOperations(item, constructionElapsedSeconds, events)
              : item.sector === "Banking"
                ? bankingOperations(item, seconds, events, playerNetWorth)
                : expansionOperations(item, seconds, events);
    const synergized = applySynergy(operation, acquiredCount);
    const founderShare = Math.min(
      1,
      Math.max(0, Number(ownershipFractions[item.id] ?? 1)),
    );
    const rampMultiplier =
      item.isAcquired && Number.isFinite(item.operatingRampSeconds)
        ? Math.min(
            1,
            Math.max(
              0.02,
              (Number(item.operatingRampSeconds) + seconds) / (4 * 3600),
            ),
          )
        : 1;
    const declaredHourlyRate = Number(
      (
        synergized.hourlyRate *
        rampMultiplier *
        founderShare *
        wealthMultiplier
      ).toFixed(2),
    );
    const pendingAmount = Number(
      (
        (item.pendingSettlementAmount ?? 0) +
        (synergized.pendingAmount ?? 0) *
          rampMultiplier *
          founderShare *
          wealthMultiplier
      ).toFixed(2),
    );
    hourlyByBusiness[item.id] = declaredHourlyRate;
    return {
      ...synergized.business,
      peakUnitsOrAssets: Math.max(
        Number(item.peakUnitsOrAssets) || 0,
        businessUnitsOrAssets(item),
        businessUnitsOrAssets(synergized.business),
      ),
      peakHourlyNetProfit: Math.max(
        Number(item.peakHourlyNetProfit) || 0,
        Number(synergized.business.hourlyNetProfit) || 0,
      ),
      operatingRampSeconds:
        item.isAcquired && Number.isFinite(item.operatingRampSeconds)
          ? Math.min(4 * 3600, Number(item.operatingRampSeconds) + seconds)
          : synergized.business.operatingRampSeconds,
      baseHourlyNetProfit: Number(
        (
          synergized.business.baseHourlyNetProfit ??
          synergized.business.hourlyNetProfit
        ).toFixed(2),
      ),
      hourlyNetProfit: declaredHourlyRate,
      pendingSettlementAmount: pendingAmount,
      settlementAccruedSeconds:
        (item.settlementAccruedSeconds ?? 0) + (item.isAcquired ? seconds : 0),
    };
  });
  return {
    businesses: next.map((item) => normalizeBusinessLevel(item, true)),
    events,
    hourlyByBusiness,
  };
}

const normalizeBusinessNames = (
  businesses: BusinessEntity[],
): BusinessEntity[] =>
  businesses
    .map((item) => normalizeBusinessLevel(item, false))
    .map((item) => {
      const baseline = DEFAULT_BUSINESSES.find(
        (candidate) => candidate.id === item.id,
      );
      const merged = baseline
        ? {
            ...baseline,
            ...item,
            unlockNetWorthRequired: baseline.unlockNetWorthRequired,
            acquisitionCost: baseline.acquisitionCost,
          }
        : item;
      return merged.id === "titan-infrastructure" ||
        merged.name === "Ironline Civic Works"
        ? { ...merged, name: "Construction Company" }
        : merged.id === "brightgrid-energy" ||
        (merged.sector === "Energy" &&
          ["BrightGrid Energy", "Surya Energy"].includes(merged.name))
        ? { ...merged, name: "Sunward Gridworks" }
        : merged.id === "cyberpulse-saas" ||
          ["SignalForge Cloud", "IT & Tech SaaS Startup", "Arcfield Software Company"].includes(merged.name)
          ? { ...merged, name: "IT & Software Company" }
          : merged;
    });
export function migrateBusinessSave(parsed: unknown): BusinessEntity[] {
  const businesses = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as { businesses?: unknown }).businesses)
      ? (parsed as { businesses: unknown[] }).businesses
      : null;
  const validRecords = Array.isArray(businesses)
    ? businesses.filter(
        (item): item is BusinessEntity =>
          Boolean(item) &&
          typeof item === "object" &&
          typeof (item as BusinessEntity).id === "string" &&
          Boolean((item as BusinessEntity).id.trim()) &&
          typeof (item as BusinessEntity).name === "string" &&
          Boolean((item as BusinessEntity).name.trim()) &&
          typeof (item as BusinessEntity).sector === "string" &&
          Boolean((item as BusinessEntity).sector.trim()) &&
          typeof (item as BusinessEntity).isAcquired === "boolean",
      )
    : [];
  if (validRecords.length === 0) throw new Error("Invalid business save");
  const existing = new Set(validRecords.map((item) => item.id));
  return normalizeBusinessNames([
    ...validRecords,
    ...DEFAULT_BUSINESSES.filter((item) => !existing.has(item.id)),
  ]);
}

export function recoverBusinessSave(
  primary: unknown,
  backup: unknown,
  root: unknown,
): { businesses: BusinessEntity[]; source: "primary" | "backup" | "root" | "defaults" } {
  type Candidate = {
    businesses: BusinessEntity[];
    source: "primary" | "backup" | "root";
    savedAt: number;
  };
  const parse = (
    candidate: unknown,
    source: Candidate["source"],
    rootSavedAt = 0,
  ): Candidate | null => {
    if (!candidate) return null;
    try {
      const parsed = typeof candidate === "string" ? JSON.parse(candidate) : candidate;
      const rawSavedAt =
        source === "root" && parsed && typeof parsed === "object"
          ? Number((parsed as Record<string, unknown>).savedAt ?? (parsed as Record<string, unknown>).saved ?? rootSavedAt)
          : parsed && typeof parsed === "object"
            ? Number((parsed as Record<string, unknown>).savedAt ?? (parsed as Record<string, unknown>).updatedAt)
            : rootSavedAt;
      return {
        businesses: migrateBusinessSave(parsed),
        source,
        savedAt: Number.isFinite(rawSavedAt) && rawSavedAt > 0 ? rawSavedAt : 0,
      };
    } catch {
      return null;
    }
  };
  let rootSave = root;
  if (typeof root === "string") {
    try {
      rootSave = JSON.parse(root);
    } catch {
      rootSave = null;
    }
  }
  const rootBusinesses =
    rootSave && typeof rootSave === "object"
      ? parse(
          (rootSave as Record<string, unknown>).businesses,
          "root",
          Number((rootSave as Record<string, unknown>).saved),
        )
      : null;
  const candidates = [
    parse(primary, "primary"),
    parse(backup, "backup"),
    rootBusinesses,
  ].filter((item): item is Candidate => Boolean(item));
  if (candidates.length) {
    const allHaveTimestamps = candidates.every((item) => item.savedAt > 0);
    const recordScore = (business: BusinessEntity) =>
      (business.isAcquired ? 1_000_000_000_000_000 : 0) +
      Math.max(0, Number(business.level) || 0) * 1_000_000_000 +
      Math.max(0, businessUnitsOrAssets(business)) * 100 +
      Math.max(0, Number(business.acquisitionCost) || 0);
    const portfolioScore = (items: BusinessEntity[]) =>
      items.reduce((sum, item) => sum + recordScore(item), 0);
    const ordered = [...candidates].sort((a, b) =>
      allHaveTimestamps
        ? b.savedAt - a.savedAt || portfolioScore(b.businesses) - portfolioScore(a.businesses)
        : portfolioScore(b.businesses) - portfolioScore(a.businesses) || b.savedAt - a.savedAt,
    );
    if (allHaveTimestamps)
      return { businesses: ordered[0].businesses, source: ordered[0].source };

    const byId = new Map<string, { business: BusinessEntity; candidate: Candidate }>();
    for (const candidate of candidates) {
      for (const business of candidate.businesses) {
        const prior = byId.get(business.id);
        if (!prior) {
          byId.set(business.id, { business, candidate });
          continue;
        }
        const entries = candidates
          .map((item) => ({ candidate: item, business: item.businesses.find((row) => row.id === business.id) }))
          .filter((item): item is { candidate: Candidate; business: BusinessEntity } => Boolean(item.business));
        const everyRecordHasTimestamp = entries.every((item) => item.candidate.savedAt > 0);
        const latest = entries.reduce((best, item) =>
          item.candidate.savedAt > best.candidate.savedAt ? item : best,
        );
        let selected = prior;
        if (everyRecordHasTimestamp) selected = latest;
        else if (prior.business.isAcquired !== business.isAcquired)
          selected = business.isAcquired ? { business, candidate } : prior;
        else if (prior.business.isAcquired && candidate.savedAt > prior.candidate.savedAt && prior.candidate.savedAt > 0)
          selected = { business, candidate };
        else if (recordScore(business) > recordScore(prior.business))
          selected = { business, candidate };
        byId.set(business.id, selected);
      }
    }
    const mergedBusinesses = ordered[0].businesses.map(
      (business) => byId.get(business.id)?.business ?? business,
    );
    const included = new Set(mergedBusinesses.map((business) => business.id));
    for (const [id, entry] of byId)
      if (!included.has(id)) mergedBusinesses.push(entry.business);
    return { businesses: mergedBusinesses, source: ordered[0].source };
  }
  return { businesses: DEFAULT_BUSINESSES, source: "defaults" };
}

export async function loadBusinessSimulation(): Promise<BusinessEntity[]> {
  let primaryRaw: string | null = null;
  let backupRaw: string | null = null;
  let rootRaw: string | null = null;
  const storeRecovered = async (businesses: BusinessEntity[]) => {
    const value = JSON.stringify({
      schemaVersion: BUSINESS_SIMULATION_SAVE_VERSION,
      savedAt: Date.now(),
      businesses,
    });
    await coordinatedWrite([
      { key: BUSINESS_SIMULATION_SAVE, value },
      { key: BUSINESS_SIMULATION_BACKUP, value },
    ]).catch(() => undefined);
    return businesses;
  };
  try {
    [primaryRaw, backupRaw, rootRaw] = await Promise.all([
      AsyncStorage.getItem(BUSINESS_SIMULATION_SAVE),
      AsyncStorage.getItem(BUSINESS_SIMULATION_BACKUP),
      AsyncStorage.getItem(GAME_SAVE_STORAGE_KEY),
    ]);
    const recovery = recoverBusinessSave(primaryRaw, backupRaw, rootRaw);
    if (primaryRaw) {
      // Keep the exact superseded or damaged value for diagnostics/manual
      // recovery; never erase the only remaining copy during reconciliation.
      await AsyncStorage.setItem(
        `${BUSINESS_SIMULATION_SAVE}-quarantine-${Date.now()}`,
        primaryRaw,
      ).catch(() => undefined);
    }
    return storeRecovered(recovery.businesses);
  } catch (error) {
    // Storage I/O failure must not be converted into defaults: callers keep
    // hydration incomplete and skip autosave until data can be read again.
    throw error;
  }
}
export async function persistBusinessSimulation(businesses: BusinessEntity[]) {
  const value = JSON.stringify({
      schemaVersion: BUSINESS_SIMULATION_SAVE_VERSION,
      savedAt: Date.now(),
      businesses,
    });
  await coordinatedWrite([
    { key: BUSINESS_SIMULATION_SAVE, value },
    { key: BUSINESS_SIMULATION_BACKUP, value },
  ]);
}
