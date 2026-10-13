import { ConstructionData } from '../src/types/business';
import { advanceConstruction, constructionAssetValue, constructionHourlyProfit, constructionStageFor, initializeConstruction } from '../src/engine/constructionCompanyEngine';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const base: ConstructionData = {
  id: 'proof-construction', name: 'Proofline Construction', sector: 'Construction_Mega', isUnlocked: true, unlockNetWorthRequired: 0,
  isAcquired: true, acquisitionCost: 180000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 95, hourlyNetProfit: 0,
  activeTenderName: 'Cedar Courtyard Homes', projectPhase: 0, phaseProgressPercent: 0, projectEscrowPayout: 56000,
  constructionStage: 'Small contractor', landOwned: 1, landCapacity: 1, selectedMarket: 'Residential',
  machinery: { excavators: 1, cranes: 1, mixers: 1, dumpTrucks: 1 }, materialsStock: 100, workers: 8,
  activeProjectId: 'residential-courtyard', projectBudget: 35000, projectCostSpent: 35000, projectDeadlineSeconds: 480,
  projectDurationSeconds: 480, projectsCompleted: 0, activeContractType: null, activeContractName: null, contractPayout: 0, contractDeadlineSeconds: 0,
};

assert(constructionStageFor(0) === 'Small contractor', 'zero net worth should be Small contractor');
assert(constructionStageFor(100000) === 'Growing company', '100K net worth should be Growing company');
assert(constructionStageFor(2500000) === 'Enterprise', '2.5M net worth should be Enterprise');
const initialized = initializeConstruction(base, 100000);
assert(initialized.constructionStage === 'Growing company', 'hydration should sync current stage');
assert(constructionHourlyProfit(initialized) > 0, 'equipment should create positive throughput');
assert(constructionAssetValue(initialized) > initialized.acquisitionCost, 'land and equipment should add asset value');
const completed = advanceConstruction(initialized, 480);
assert(completed.business.activeProjectId === null, 'completed project should clear active project');
assert(completed.business.projectsCompleted === 1, 'completed project count should increment');
assert(completed.cashDelta === 21000, 'payout should equal project payout minus budget');
assert(completed.events.some(event => event.includes('completed and paid')), 'completion event should be emitted');
console.log(JSON.stringify({
  stages: { zero: constructionStageFor(0), growing: constructionStageFor(100000), enterprise: constructionStageFor(2500000) },
  hourlyProfit: constructionHourlyProfit(initialized),
  assetValue: constructionAssetValue(initialized),
  completionCashDelta: completed.cashDelta,
  projectsCompleted: completed.business.projectsCompleted,
  events: completed.events,
}, null, 2));
