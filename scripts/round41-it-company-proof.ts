import { DEFAULT_IT_SOFTWARE_STATE, advanceITCompany, initializeITCompany, itHourlyProfit, itStageFor, launchITProduct, startITProject, upgradeITOffice } from '../src/engine/itCompanyEngine';
import { ITSoftwareData } from '../src/types/business';
import { migrateBusinessSave } from '../src/engine/businessSimulation';

const base = {
  id: 'proof-it', name: 'Arcfield Software Company', sector: 'Tech_SaaS', isUnlocked: true, unlockNetWorthRequired: 0, isAcquired: true, acquisitionCost: 60_000, legalStatus: 'Licensed_Legal', policeHeat: 0, stability: 90, hourlyNetProfit: 0,
  ...DEFAULT_IT_SOFTWARE_STATE,
} as ITSoftwareData;

function assert(condition: unknown, message: string) { if (!condition) throw new Error(message); }

const startup = initializeITCompany({ ...base, activeSubscribers: 100, serverCapacity: 1000, activeProjects: [], products: [] }, 75_000);
assert(startup.companyStage === 'Startup Studio', 'startup stage');
const growing = initializeITCompany(startup, 250_000);
assert(growing.companyStage === 'Growing Company', 'growing stage');
const enterprise = initializeITCompany(growing, 10_000_000);
assert(enterprise.companyStage === 'Technology Enterprise', 'enterprise stage');

const staffed = { ...growing, formationComplete: true, developers: 5, designers: 2, qaStaff: 2, payrollPerHour: 200 };
const withProject = startITProject(staffed, 'workflow-portal', 1);
assert(Boolean(withProject), 'project should start');
const projectTick = advanceITCompany(withProject as ITSoftwareData, 600, 250_000);
assert(projectTick.business.activeProjects[0]?.progress > 0, 'project progress should advance');
assert(projectTick.business.payrollPerHour === 200, 'payroll should persist');

const launched = launchITProduct(enterprise, 'flowdesk');
assert(Boolean(launched) && (launched as ITSoftwareData).products.length === 1, 'product should launch');
const office = upgradeITOffice(launched as ITSoftwareData);
assert(office.officeTier === 2 && office.projectSlots === 2, 'office upgrade should unlock capacity');
const profit = itHourlyProfit(office);
assert(Number.isFinite(profit) && profit >= 0, 'profit should be finite and non-negative');

const legacy = initializeITCompany({ ...base, activeSubscribers: 6100, serverCapacity: 10000, openBugs: 38, activeProjects: undefined as never, products: undefined as never }, 1_000_000);
assert(legacy.companyStage === 'Established Company', 'legacy stage migration');
assert(Array.isArray(legacy.activeProjects) && Array.isArray(legacy.products), 'legacy arrays should migrate');
const migrated = migrateBusinessSave({ schemaVersion: 3, businesses: [{ ...base, name: 'SignalForge Cloud', activeProjects: undefined, products: undefined }] });
const migratedIT = migrated.find((item) => item.id === base.id) as ITSoftwareData;
assert(migratedIT.name === 'Arcfield Software Company', 'legacy SaaS name should migrate');

console.log(JSON.stringify({
  stageProgression: [itStageFor(75_000), itStageFor(250_000), itStageFor(1_000_000), itStageFor(10_000_000)],
  project: { progressAfter10m: projectTick.business.activeProjects[0]?.progress ?? 0, phase: projectTick.business.activeProjects[0]?.phase ?? 'Delivered', hourlyProfit: projectTick.hourlyRate },
  productUsers: (launched as ITSoftwareData).activeSubscribers,
  office: { tier: office.officeTier, capacity: office.officeCapacity, slots: office.projectSlots },
  legacyMigration: { stage: legacy.companyStage, arraysHydrated: Array.isArray(legacy.activeProjects) && Array.isArray(legacy.products), renamed: migratedIT.name },
}, null, 2));
