import { ConstructionData } from '../types/business';

export type ConstructionStage = NonNullable<ConstructionData['constructionStage']>;
export type ConstructionMarket = NonNullable<ConstructionData['selectedMarket']>;

export type ConstructionProject = {
  id: string;
  name: string;
  market: ConstructionMarket;
  landRequired: number;
  budget: number;
  durationSeconds: number;
  payout: number;
  minimumStage: ConstructionStage;
  description: string;
};

export type ConstructionContract = {
  id: string;
  name: string;
  type: 'Government' | 'Private';
  minimumStage: ConstructionStage;
  payout: number;
  deadlineSeconds: number;
  reputation: number;
  description: string;
};

export type ConstructionUpgrade = {
  id: string;
  name: string;
  cost: number;
  description: string;
  minimumStage: ConstructionStage;
};

export const CONSTRUCTION_PROJECTS: ConstructionProject[] = [
  { id: 'residential-courtyard', name: 'Cedar Courtyard Homes', market: 'Residential', landRequired: 1, budget: 35000, durationSeconds: 8 * 60, payout: 56000, minimumStage: 'Small contractor', description: 'Starter homes with a dependable private margin.' },
  { id: 'commercial-office', name: 'Northline Office Build', market: 'Commercial', landRequired: 2, budget: 120000, durationSeconds: 18 * 60, payout: 205000, minimumStage: 'Growing company', description: 'A flexible office block with milestone payments.' },
  { id: 'industrial-yard', name: 'Riverton Logistics Yard', market: 'Industrial', landRequired: 3, budget: 360000, durationSeconds: 34 * 60, payout: 620000, minimumStage: 'Large company', description: 'Warehouse and loading capacity for regional operators.' },
  { id: 'civic-transit', name: 'Lakeshore Transit Link', market: 'Industrial', landRequired: 5, budget: 1200000, durationSeconds: 60 * 60, payout: 2100000, minimumStage: 'Enterprise', description: 'A public infrastructure tender with a major reputation lift.' },
];

export const CONSTRUCTION_CONTRACTS: ConstructionContract[] = [
  { id: 'private-developer', name: 'Private Developer Framework', type: 'Private', minimumStage: 'Small contractor', payout: 18000, deadlineSeconds: 20 * 60, reputation: 2, description: 'Fast residential work with a short payment cycle.' },
  { id: 'city-permit-yard', name: 'City Works Yard Tender', type: 'Government', minimumStage: 'Growing company', payout: 95000, deadlineSeconds: 45 * 60, reputation: 5, description: 'Public procurement with a larger compliance burden.' },
  { id: 'state-infrastructure', name: 'State Infrastructure Package', type: 'Government', minimumStage: 'Large company', payout: 480000, deadlineSeconds: 90 * 60, reputation: 10, description: 'Higher-value civic works for established operators.' },
  { id: 'national-corridor', name: 'National Corridor Program', type: 'Government', minimumStage: 'Enterprise', payout: 2400000, deadlineSeconds: 3 * 60 * 60, reputation: 18, description: 'Multi-city infrastructure and enterprise-level credibility.' },
];

export const CONSTRUCTION_UPGRADES: ConstructionUpgrade[] = [
  { id: 'storage-yard', name: 'Larger Storage Yard', cost: 75000, description: '+50 material capacity', minimumStage: 'Small contractor' },
  { id: 'advanced-machinery', name: 'Advanced Machinery', cost: 120000, description: '+30% project work efficiency', minimumStage: 'Growing company' },
  { id: 'city-expansion', name: 'New City Expansion', cost: 250000, description: 'Unlocks larger project sites', minimumStage: 'Large company' },
  { id: 'government-contracts', name: 'Government Contracts Desk', cost: 500000, description: 'Access to national infrastructure tenders', minimumStage: 'Enterprise' },
];

const STAGE_ORDER: ConstructionStage[] = ['Small contractor', 'Growing company', 'Large company', 'Enterprise'];
const STAGE_THRESHOLDS = [0, 100000, 500000, 2500000];

export function constructionStageFor(netWorth: number): ConstructionStage {
  const index = STAGE_THRESHOLDS.reduce((stage, threshold, position) => netWorth >= threshold ? position : stage, 0);
  return STAGE_ORDER[index];
}

export function stageIndex(stage: ConstructionStage): number {
  return STAGE_ORDER.indexOf(stage);
}

export function canUseStage(current: ConstructionStage, required: ConstructionStage): boolean {
  return stageIndex(current) >= stageIndex(required);
}

export function initializeConstruction(business: ConstructionData, netWorth: number): ConstructionData {
  const stage = constructionStageFor(netWorth);
  return {
    ...business,
    constructionStage: stage,
    landOwned: business.landOwned ?? 0,
    landCapacity: business.landCapacity ?? 1,
    selectedMarket: business.selectedMarket ?? 'Residential',
    machinery: business.machinery ?? { excavators: 0, cranes: 0, mixers: 0, dumpTrucks: 0 },
    materialsStock: business.materialsStock ?? 0,
    workers: business.workers ?? 4,
    activeProjectId: business.activeProjectId ?? null,
    projectBudget: business.projectBudget ?? 0,
    projectCostSpent: business.projectCostSpent ?? 0,
    projectDeadlineSeconds: business.projectDeadlineSeconds ?? 0,
    projectDurationSeconds: business.projectDurationSeconds ?? 0,
    projectsCompleted: business.projectsCompleted ?? 0,
    activeContractType: business.activeContractType ?? null,
    activeContractName: business.activeContractName ?? null,
    contractPayout: business.contractPayout ?? 0,
    contractDeadlineSeconds: business.contractDeadlineSeconds ?? 0,
  };
}

export function constructionAssetValue(business: ConstructionData): number {
  const machinery = business.machinery ?? { excavators: 0, cranes: 0, mixers: 0, dumpTrucks: 0 };
  return Number((business.acquisitionCost + (business.landOwned ?? 0) * 45000 + machinery.excavators * 80000 + machinery.cranes * 150000 + machinery.mixers * 60000 + machinery.dumpTrucks * 90000).toFixed(2));
}

export function constructionHourlyProfit(business: ConstructionData): number {
  if (!business.isAcquired) return 0;
  const machinery = business.machinery ?? { excavators: 0, cranes: 0, mixers: 0, dumpTrucks: 0 };
  const equipmentCapacity = machinery.excavators * 75 + machinery.cranes * 110 + machinery.mixers * 55 + machinery.dumpTrucks * 65;
  const projectRunRate = business.activeProjectId ? Math.max(0, (business.projectBudget ?? 0) * 0.08) : 0;
  const contractRunRate = business.activeContractType ? Math.max(0, (business.contractPayout ?? 0) / 8) : 0;
  return Number((Math.max(0, equipmentCapacity + projectRunRate + contractRunRate - ((business.workers ?? 0) * 18))).toFixed(2));
}

export function advanceConstruction(business: ConstructionData, elapsedSeconds: number): { business: ConstructionData; events: string[]; cashDelta: number } {
  const events: string[] = [];
  let next = initializeConstruction(business, 0);
  let cashDelta = 0;
  if (!next.isAcquired) return { business: { ...next, hourlyNetProfit: 0 }, events, cashDelta };
  if (next.activeProjectId && (next.projectDeadlineSeconds ?? 0) > 0) {
    const efficiency = next.machinery?.cranes && next.machinery.cranes > 0 ? 1.3 : 1;
    const remaining = Math.max(0, (next.projectDeadlineSeconds ?? 0) - elapsedSeconds * efficiency);
    if (remaining === 0) {
      const project = CONSTRUCTION_PROJECTS.find(item => item.id === next.activeProjectId);
      if (project) {
        cashDelta += project.payout - (next.projectCostSpent ?? project.budget);
        events.push(`${next.name}: ${project.name} completed and paid.`);
      }
      next = { ...next, activeProjectId: null, projectDeadlineSeconds: 0, projectDurationSeconds: 0, projectBudget: 0, projectCostSpent: 0, projectsCompleted: (next.projectsCompleted ?? 0) + 1, activeTenderName: null, projectPhase: 0, phaseProgressPercent: 0 };
    } else {
      const duration = Math.max(1, next.projectDurationSeconds ?? 1);
      next = { ...next, projectDeadlineSeconds: remaining, phaseProgressPercent: Math.min(99, Math.round((1 - remaining / duration) * 100)), projectPhase: Math.min(3, Math.floor((1 - remaining / duration) * 4)) as ConstructionData['projectPhase'] };
    }
  }
  if (next.activeContractType && (next.contractDeadlineSeconds ?? 0) > 0) {
    const deadline = Math.max(0, (next.contractDeadlineSeconds ?? 0) - elapsedSeconds);
    next = { ...next, contractDeadlineSeconds: deadline };
    if (deadline === 0) {
      cashDelta += next.contractPayout ?? 0;
      events.push(`${next.name}: ${next.activeContractName ?? 'Contract'} paid out.`);
      next = { ...next, activeContractType: null, activeContractName: null, contractPayout: 0, contractReputation: (next.contractReputation ?? 0) + 1 };
    }
  }
  const hourlyNetProfit = constructionHourlyProfit(next);
  return { business: { ...next, hourlyNetProfit, baseHourlyNetProfit: hourlyNetProfit }, events, cashDelta };
}
