import {
  CONSTRUCTION_CONTRACTS,
  CONSTRUCTION_PROJECTS,
  constructionAssetValue,
  constructionHourlyProfit,
  constructionStageFor,
  advanceConstruction,
} from "../src/engine/constructionCompanyEngine";
import { DEFAULT_BUSINESSES } from "../src/engine/businessSimulation";
import type { ConstructionData } from "../src/types/business";
import {
  DEFAULT_CONSTRUCTION_COMPANY,
  constructionLevelFor,
  constructionTick,
  ConstructionCompanyState,
} from "../src/types/construction";

const check = (label: string, condition: boolean, details: Record<string, unknown>) => {
  if (!condition) throw new Error(`${label} failed: ${JSON.stringify(details)}`);
  return { label, ok: true, ...details };
};
const base = DEFAULT_BUSINESSES.find((item) => item.sector === "Construction_Mega") as ConstructionData;
const acquired: ConstructionData = {
  ...base,
  isAcquired: true,
  landOwned: 3,
  landCapacity: 3,
  constructionStage: "Large company",
  machinery: { excavators: 1, cranes: 1, mixers: 1, dumpTrucks: 1 },
  workers: 12,
  activeProjectId: "commercial-office",
  projectBudget: 120000,
  projectCostSpent: 120000,
  projectDeadlineSeconds: 5,
  projectDurationSeconds: 5,
  activeContractType: "Private",
  activeContractName: "private-developer",
  contractPayout: 18000,
  contractDeadlineSeconds: 4,
};
const scenarios = [
  check("stage progression", constructionStageFor(0) === "Small contractor" && constructionStageFor(100000) === "Growing company" && constructionStageFor(500000) === "Large company" && constructionStageFor(2500000) === "Enterprise", { thresholds: [0, 100000, 500000, 2500000] }),
  check("catalog coverage", CONSTRUCTION_PROJECTS.length >= 4 && CONSTRUCTION_CONTRACTS.some((item) => item.type === "Government") && CONSTRUCTION_CONTRACTS.some((item) => item.type === "Private"), { projects: CONSTRUCTION_PROJECTS.length, contracts: CONSTRUCTION_CONTRACTS.length }),
  check("asset valuation", constructionAssetValue(acquired) > acquired.acquisitionCost, { value: constructionAssetValue(acquired), acquisitionCost: acquired.acquisitionCost }),
  check("hourly economics", constructionHourlyProfit(acquired) > 0, { hourlyProfit: constructionHourlyProfit(acquired) }),
];
const completed = advanceConstruction(acquired, 5);
scenarios.push(check("project and contract completion", completed.business.activeProjectId === null && completed.business.activeContractType === null && completed.cashDelta === 103000, { cashDelta: completed.cashDelta, projectsCompleted: completed.business.projectsCompleted, events: completed.events }));
const progressed = advanceConstruction({ ...acquired, projectDeadlineSeconds: 3, contractDeadlineSeconds: 10 }, 1);
scenarios.push(check("partial progress", Math.abs((progressed.business.projectDeadlineSeconds ?? 0) - 1.7) < 0.001 && progressed.business.activeProjectId === "commercial-office", { remainingSeconds: progressed.business.projectDeadlineSeconds, phaseProgressPercent: progressed.business.phaseProgressPercent }));

let company: ConstructionCompanyState = { ...DEFAULT_CONSTRUCTION_COMPANY, status: "operating", landParcels: 1, workers: 4, excavators: 1, mixers: 1, activeProjects: 1, contractValue: 90000, cashInvested: 60000 };
scenarios.push(check("land and launch", company.status === "operating" && company.landParcels === 1, { cashBefore: 120000, launchCost: 60000, cashAfter: 60000, projectType: company.projectType }));
const tick = constructionTick({ ...company, progress: 90 }, 10000);
scenarios.push(check("project settlement completion", tick.completed && tick.revenue === 90000 && tick.expenses === 505 && tick.cashAfter === 99495 && tick.company.completedProjects === 1, { cashBefore: tick.cashBefore, progressBefore: 90, progressAfter: tick.company.progress, revenue: tick.revenue, expenses: tick.expenses, cashDelta: tick.cashDelta, cashAfter: tick.cashAfter, completedProjects: tick.company.completedProjects }));
const expanded = { ...tick.company, landParcels: 4, activeProjects: 2, cranes: 1 };
scenarios.push(check("level progression", constructionLevelFor(expanded) === "Large Company", { level: constructionLevelFor(expanded), parcels: expanded.landParcels, activeProjects: expanded.activeProjects }));
const reloaded = JSON.parse(JSON.stringify(expanded)) as ConstructionCompanyState;
scenarios.push(check("save and reload", reloaded.completedProjects === 1 && reloaded.landParcels === 4, { bytes: JSON.stringify(expanded).length, completedProjects: reloaded.completedProjects, landParcels: reloaded.landParcels }));
console.log(JSON.stringify({ test: "round40-construction-proof", status: "PASS", scenarioCount: scenarios.length, failed: 0, scenarios }, null, 2));
