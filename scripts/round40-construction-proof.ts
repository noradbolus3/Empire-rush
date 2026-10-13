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

console.log(JSON.stringify({ test: "round40-construction-proof", status: "PASS", scenarioCount: scenarios.length, scenarios }, null, 2));
