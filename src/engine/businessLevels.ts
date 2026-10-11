import type { BusinessEntity, BusinessCategory } from "../types/business";

export type BusinessLevel = 1 | 2 | 3 | 4;
export type LevelMetric = "units" | "assets";
export type BusinessLevelConfig = {
  milestones: Record<
    BusinessLevel,
    { metric: LevelMetric; threshold: number; teaser: string }
  >;
  controls: Record<BusinessLevel, string[]>;
  economy: { revenueLabel: string; expenseLabel: string; netLabel: string };
};

const common = (
  metric: LevelMetric,
  l2: number,
  l3: number,
  l4: number,
  noun: string = metric,
): BusinessLevelConfig => ({
  milestones: {
    1: { metric, threshold: 0, teaser: "Basic operation" },
    2: {
      metric,
      threshold: l2,
      teaser: `Unlocks at Level 2: ${l2.toLocaleString()} ${noun}`,
    },
    3: {
      metric,
      threshold: l3,
      teaser: `Unlocks at Level 3: ${l3.toLocaleString()} ${noun}`,
    },
    4: {
      metric,
      threshold: l4,
      teaser: `Unlocks at Level 4: ${l4.toLocaleString()} ${noun}`,
    },
  },
  controls: {
    1: ["Automatic income", "One simple upgrade"],
    2: ["Units", "Finance", "Capacity and operating upgrades"],
    3: ["Operations", "Employees", "Resources", "Departments"],
    4: ["Cities and markets", "Subsidiaries", "Holding company"],
  },
  economy: {
    revenueLabel: "Revenue/hr",
    expenseLabel: "Operating expenses/hr",
    netLabel: "Net income/hr",
  },
});

export const BUSINESS_LEVEL_CONFIG: Record<
  BusinessCategory,
  BusinessLevelConfig
> = {
  Retail: common("units", 2500, 10000, 50000),
  Mobility: common("assets", 20, 50, 100, "vehicles"),
  Tech_SaaS: common("assets", 25000, 100000, 500000),
  Construction_Mega: common("assets", 3, 10, 25),
  Real_Estate: common("assets", 2, 10, 50),
  Energy: common("assets", 2, 10, 50),
  Pharma: common("assets", 2, 10, 50),
  Media: common("assets", 2, 10, 50),
  Sports: common("assets", 2, 10, 50),
  Airline: common("assets", 2, 10, 50),
};

export function businessUnitsOrAssets(business: BusinessEntity): number {
  if (business.sector === "Retail")
    return Math.max(0, Number(business.stockUnits) || 0);
  if (business.sector === "Mobility") {
    return (
      Math.max(0, Number(business.economySedans) || 0) +
      Math.max(0, Number(business.electricEVs) || 0) +
      Math.max(0, Number(business.luxuryLimos) || 0)
    );
  }
  if ("branchCount" in business)
    return Math.max(0, Number(business.branchCount) || 0);
  if (business.sector === "Tech_SaaS")
    return Math.max(0, Number(business.activeSubscribers) || 0);
  if (business.sector === "Construction_Mega")
    return Math.max(0, Number(business.projectPhase) || 0);
  return 1;
}

export function hasOwnedLevel2Feature(business: BusinessEntity): boolean {
  if (business.sector === "Retail")
    return (
      business.maxStockCapacity > 2500 ||
      business.hasSecurity ||
      business.hasManager ||
      Boolean(business.autoRestockEnabled)
    );
  if (business.sector === "Mobility")
    return (
      business.electricEVs > 0 ||
      business.luxuryLimos > 0 ||
      business.surgeActive
    );
  return false;
}

export function impliedBusinessLevel(business: BusinessEntity): BusinessLevel {
  const config = BUSINESS_LEVEL_CONFIG[business.sector];
  const peak = Math.max(
    Number(business.peakUnitsOrAssets) || 0,
    businessUnitsOrAssets(business),
  );
  let level: BusinessLevel = 1;
  for (const candidate of [2, 3, 4] as BusinessLevel[])
    if (peak >= config.milestones[candidate].threshold) level = candidate;
  if (hasOwnedLevel2Feature(business))
    level = Math.max(level, 2) as BusinessLevel;
  return level;
}

export function normalizeBusinessLevel(
  business: BusinessEntity,
  celebrate = false,
): BusinessEntity {
  const peakUnitsOrAssets = Math.max(
    Number(business.peakUnitsOrAssets) || 0,
    businessUnitsOrAssets(business),
  );
  const peakHourlyNetProfit = Math.max(
    Number(business.peakHourlyNetProfit) || 0,
    Number(business.hourlyNetProfit) || 0,
  );
  const next = {
    ...business,
    peakUnitsOrAssets,
    peakHourlyNetProfit,
  } as BusinessEntity;
  const level = impliedBusinessLevel(next);
  const previousLevel = Math.max(
    1,
    Number(business.level) || 1,
  ) as BusinessLevel;
  const storedCelebrated = Math.max(
    1,
    Number(business.lastCelebratedLevel) || 1,
  );
  return {
    ...next,
    level: Math.max(previousLevel, level) as BusinessLevel,
    lastCelebratedLevel: !celebrate
      ? level
      : level > storedCelebrated
        ? level
        : storedCelebrated,
    levelUpNotice: !celebrate
      ? undefined
      : level > storedCelebrated
        ? {
            level,
            teaser:
              BUSINESS_LEVEL_CONFIG[business.sector].controls[level].join(
                " · ",
              ),
          }
        : business.levelUpNotice,
  } as BusinessEntity;
}

export function levelConfig(business: BusinessEntity) {
  return BUSINESS_LEVEL_CONFIG[business.sector];
}

export function clearLevelUpNotice(business: BusinessEntity): BusinessEntity {
  return { ...business, levelUpNotice: undefined } as BusinessEntity;
}
