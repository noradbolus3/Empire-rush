import {
  calculateNetWorth,
  emptyFinancialState,
  settleHour,
} from "../src/engine/financialCore";
import type { BusinessEntity } from "../src/types/business";
import {
  BUSINESS_LEVEL_CONFIG,
  businessUnitsOrAssets,
  normalizeBusinessLevel,
} from "../src/engine/businessLevels";

const now = 1_800_000_000_000;
const retailSeed = {
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
  unitWholesaleCost: 2,
  monthlyRent: 800,
  monthlyPayroll: 1200,
  autoRestockEnabled: false,
} as BusinessEntity;
const mobilitySeed = {
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
} as BusinessEntity;
const retailLevel1 = normalizeBusinessLevel({
  ...retailSeed,
  isAcquired: true,
  stockUnits: 1000,
  level: 1,
  lastCelebratedLevel: 1,
} as any);
const retailLevel2Input = { ...retailLevel1, stockUnits: 2500 };
const retailCrossed = normalizeBusinessLevel(retailLevel2Input as any, true);
const mobilityLevel1 = normalizeBusinessLevel({
  ...mobilitySeed,
  isAcquired: true,
  economySedans: 10,
  level: 1,
  lastCelebratedLevel: 1,
} as any);
const mobilityCrossed = normalizeBusinessLevel(
  { ...mobilityLevel1, economySedans: 20 } as any,
  true,
);
const soldAfterPeak = normalizeBusinessLevel({
  ...mobilityCrossed,
  economySedans: 10,
} as any);
const reloaded = normalizeBusinessLevel(
  JSON.parse(JSON.stringify(soldAfterPeak)),
  false,
);
const newSave = emptyFinancialState(now);
const withRetail = { ...newSave, cash: 10_000, businesses: [retailLevel1] };
const headerIncome = settleHour(withRetail).projectedHourlyNet;

console.log(
  JSON.stringify(
    {
      levelCrossing: {
        company: retailCrossed.name,
        before: {
          level: retailLevel1.level,
          peakUnits: retailLevel1.peakUnitsOrAssets,
          teaser: BUSINESS_LEVEL_CONFIG.Retail.milestones[2].teaser,
        },
        after: {
          level: retailCrossed.level,
          peakUnits: retailCrossed.peakUnitsOrAssets,
          currentUnits: businessUnitsOrAssets(retailCrossed),
          notice: retailCrossed.levelUpNotice,
        },
        newControls: BUSINESS_LEVEL_CONFIG.Retail.controls[2],
      },
      mobilityThreshold: {
        beforeVehicles: businessUnitsOrAssets(mobilityLevel1),
        afterVehicles: businessUnitsOrAssets(mobilityCrossed),
        level: mobilityCrossed.level,
        teaser: BUSINESS_LEVEL_CONFIG.Mobility.milestones[2].teaser,
      },
      peakPersistence: {
        afterSellingAsset: {
          currentVehicles: businessUnitsOrAssets(soldAfterPeak),
          level: soldAfterPeak.level,
          peakVehicles: soldAfterPeak.peakUnitsOrAssets,
        },
        afterReload: {
          currentVehicles: businessUnitsOrAssets(reloaded),
          level: reloaded.level,
          peakVehicles: reloaded.peakUnitsOrAssets,
          lastCelebratedLevel: reloaded.lastCelebratedLevel,
          notice: reloaded.levelUpNotice ?? null,
        },
      },
      level1Card: {
        company: retailLevel1.name,
        level: retailLevel1.level,
        status: "OPERATING",
        revenuePerHour: retailLevel1.hourlyNetProfit,
        netPerHour: retailLevel1.hourlyNetProfit,
        oneAction: "RESTOCK 1,000",
        extraTabs: [],
        level2Teaser: BUSINESS_LEVEL_CONFIG.Retail.milestones[2].teaser,
      },
      summaryStrip: {
        cash: withRetail.cash,
        netPerHour: headerIncome,
        owned: 1,
        totalCategories: 10,
        netWorth: calculateNetWorth(withRetail),
      },
    },
    null,
    2,
  ),
);
