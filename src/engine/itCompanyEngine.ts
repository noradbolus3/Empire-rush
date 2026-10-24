import { IT_CONTRACTS, IT_PROJECTS } from '../data/itCompanyProjects';
import { IT_PRODUCTS } from '../data/itCompanyProducts';
import { ITCompanyStage, ITIncidentState, ITProjectState, ITSoftwareState, IT_STAGE_ORDER, IT_STAGE_THRESHOLDS } from '../types/itCompany';
import { ITSoftwareData } from '../types/business';

export type ITSimulationResult = {
  business: ITSoftwareData;
  hourlyRate: number;
  pendingAmount: number;
  cashDelta: number;
  events: string[];
};

export const DEFAULT_IT_SOFTWARE_STATE: ITSoftwareState = {
  companyStage: 'Startup Studio',
  officeTier: 1,
  officeCapacity: 8,
  offices: [{ id: 'office-home-base', city: 'Austin', capacity: 8, operatingCostPerHour: 22, open: true }],
  developers: 2,
  designers: 1,
  qaStaff: 1,
  salesStaff: 0,
  managers: 0,
  payrollPerHour: 72,
  projectSlots: 1,
  activeProjects: [],
  clientContracts: [],
  products: [],
  cloudCapacity: 10_000,
  cloudUsage: 6_100,
  cloudCostPerHour: 45,
  securityLevel: 1,
  incidentRisk: 3,
  activeIncidents: [],
  researchBudgetPerHour: 0,
  internationalOffices: 0,
  clientSatisfaction: 72,
  formationComplete: false,
  firstClientWon: false,
  totalProjectsDelivered: 0,
  totalContractRevenue: 0,
  activeSubscribers: 6_100,
  serverCapacity: 10_000,
  openBugs: 6,
};

export function itStageFor(netWorth: number): ITCompanyStage {
  let stage: ITCompanyStage = 'Startup Studio';
  for (const candidate of IT_STAGE_ORDER) {
    if (netWorth >= IT_STAGE_THRESHOLDS[candidate]) stage = candidate;
  }
  return stage;
}

export function itStageIndex(stage: ITCompanyStage): number {
  return Math.max(0, IT_STAGE_ORDER.indexOf(stage));
}

export function canUseITStage(current: ITCompanyStage, required: ITCompanyStage): boolean {
  return itStageIndex(current) >= itStageIndex(required);
}

export function initializeITCompany(business: ITSoftwareData, netWorth: number): ITSoftwareData {
  const legacy = business as Partial<ITSoftwareState>;
  const merged: ITSoftwareData = {
    ...business,
    ...DEFAULT_IT_SOFTWARE_STATE,
    ...legacy,
    offices: Array.isArray(legacy.offices) && legacy.offices.length ? legacy.offices : DEFAULT_IT_SOFTWARE_STATE.offices,
    activeProjects: Array.isArray(legacy.activeProjects) ? legacy.activeProjects : [],
    clientContracts: Array.isArray(legacy.clientContracts) ? legacy.clientContracts : [],
    products: Array.isArray(legacy.products) ? legacy.products : [],
    activeIncidents: Array.isArray(legacy.activeIncidents) ? legacy.activeIncidents : [],
  };
  const stage = itStageFor(netWorth);
  const capacity = Math.max(merged.cloudCapacity ?? 0, merged.serverCapacity ?? 0, 1);
  return {
    ...merged,
    companyStage: stage,
    cloudCapacity: capacity,
    serverCapacity: capacity,
    cloudUsage: Math.min(merged.cloudUsage ?? merged.activeSubscribers ?? 0, capacity),
    activeSubscribers: merged.activeSubscribers ?? merged.cloudUsage ?? 0,
    payrollPerHour: Math.max(0, merged.payrollPerHour ?? 0),
    projectSlots: Math.max(1, merged.projectSlots ?? 1),
    securityLevel: Math.max(1, merged.securityLevel ?? 1),
    reputation: Math.max(0, Math.min(100, merged.reputation ?? 50)),
    clientSatisfaction: Math.max(0, Math.min(100, merged.clientSatisfaction ?? 70)),
    formationComplete: Boolean(merged.formationComplete),
  };
}

export function itCompanyAssetValue(business: ITSoftwareData): number {
  const officeValue = (business.offices ?? []).filter((office) => office.open).reduce((sum, office) => sum + office.capacity * 1_200, 0);
  const productValue = (business.products ?? []).reduce((sum, product) => sum + product.activeUsers * 14, 0);
  const pipelineValue = (business.activeProjects ?? []).reduce((sum, project) => sum + project.spent, 0);
  return Number((business.acquisitionCost + officeValue + productValue + pipelineValue + business.securityLevel * 12_000).toFixed(2));
}

function teamCapacity(business: ITSoftwareData): number {
  return business.developers * 1.3 + business.designers * 0.75 + business.qaStaff * 0.9 + business.managers * 0.5;
}

function productRevenuePerHour(business: ITSoftwareData): number {
  return (business.products ?? []).filter((product) => product.launched).reduce((sum, product) => sum + product.activeUsers * (product.monthlyRevenue / 720), 0);
}

function projectRevenuePerHour(business: ITSoftwareData): number {
  return (business.activeProjects ?? []).filter((project) => project.phase !== 'Delivered').reduce((sum, project) => sum + Math.max(0, project.budget - project.spent) / Math.max(1, project.deadlineSeconds / 3600), 0);
}

export function itHourlyProfit(business: ITSoftwareData): number {
  if (!business.isAcquired) return 0;
  const quality = Math.max(0.45, Math.min(1.25, ((business.reputation ?? 50) / 100) * ((business.clientSatisfaction ?? 70) / 100) + 0.35));
  const revenue = projectRevenuePerHour(business) * 0.18 + productRevenuePerHour(business) + business.clientContracts.filter((contract) => contract.active).reduce((sum, contract) => sum + contract.value / Math.max(1, contract.deadlineSeconds / 3600), 0) * 0.08;
  const costs = business.payrollPerHour + business.cloudCostPerHour + business.offices.filter((office) => office.open).reduce((sum, office) => sum + office.operatingCostPerHour, 0) + business.researchBudgetPerHour;
  return Number(Math.max(0, (revenue * quality) - costs).toFixed(2));
}

function nextPhase(progress: number): ITProjectState['phase'] {
  if (progress >= 100) return 'Delivered';
  if (progress >= 72) return 'QA';
  if (progress >= 28) return 'Development';
  return 'Scoping';
}

function maybeIncident(business: ITSoftwareData, seconds: number, events: string[]): ITIncidentState[] {
  const existing = (business.activeIncidents ?? []).map((incident) => ({ ...incident, remainingSeconds: Math.max(0, incident.remainingSeconds - seconds) })).filter((incident) => !incident.resolved && incident.remainingSeconds > 0);
  if (existing.length || business.securityLevel >= 4 || business.incidentRisk <= 0) return existing;
  const riskWindow = business.incidentRisk * seconds / 3600;
  if (riskWindow < 0.01) return existing;
  const kind: ITIncidentState['kind'] = business.securityLevel <= 1 ? 'Security breach' : business.cloudUsage > business.cloudCapacity * 0.9 ? 'Outage' : 'Compliance review';
  events.push(`${business.name}: ${kind} risk detected; security investment protects client trust.`);
  return [{ id: `${kind}-${business.totalProjectsDelivered}-${business.activeProjects.length}`, kind, severity: business.securityLevel <= 1 ? 3 : 1, resolved: false, remainingSeconds: 900 }, ...existing];
}

export function advanceITCompany(raw: ITSoftwareData, elapsedSeconds: number, netWorth: number): ITSimulationResult {
  const business = initializeITCompany(raw, netWorth);
  const events: string[] = [];
  if (!business.isAcquired) return { business: { ...business, hourlyNetProfit: 0 }, hourlyRate: 0, pendingAmount: 0, cashDelta: 0, events };
  const projects = business.activeProjects.map((project) => {
    const requiredTeam = Math.max(1, project.developers + project.designers + project.qa);
    const efficiency = Math.max(0.15, Math.min(1.6, teamCapacity(business) / requiredTeam));
    const progress = Math.min(100, project.progress + (elapsedSeconds / Math.max(1, project.deadlineSeconds)) * 100 * efficiency);
    return { ...project, progress: Number(progress.toFixed(2)), spent: Math.min(project.budget, project.spent + (project.budget * elapsedSeconds) / Math.max(1, project.deadlineSeconds)), phase: nextPhase(progress), deadlineSeconds: Math.max(0, project.deadlineSeconds - elapsedSeconds) };
  });
  const delivered = projects.filter((project) => project.phase === 'Delivered' && !business.lastDeliveredProjectId?.includes(project.id));
  const deliveredPayout = delivered.reduce((sum, project) => sum + Math.max(0, project.budget * 1.625 - project.spent), 0);
  if (delivered.length) events.push(`${business.name}: ${delivered.length} client project${delivered.length > 1 ? 's' : ''} delivered; payment released.`);
  const activeProjects = projects.filter((project) => project.phase !== 'Delivered');
  const incidents = maybeIncident(business, elapsedSeconds, events);
  const incidentPenalty = incidents.reduce((sum, incident) => sum + incident.severity * 0.08, 0);
  const next: ITSoftwareData = {
    ...business,
    companyStage: itStageFor(netWorth),
    activeProjects,
    activeIncidents: incidents,
    cloudUsage: Math.min(business.cloudCapacity, Math.max(0, business.activeSubscribers + business.products.reduce((sum, product) => sum + (product.launched ? product.activeUsers : 0), 0))),
    openBugs: Math.max(0, business.openBugs + (business.activeProjects.length > 0 ? Math.floor(elapsedSeconds / 180) : 0) - (business.qaStaff > 0 ? Math.floor(elapsedSeconds / 300) : 0)),
    activeSubscribers: business.activeSubscribers,
    totalProjectsDelivered: business.totalProjectsDelivered + delivered.length,
    totalContractRevenue: business.totalContractRevenue + deliveredPayout,
    firstClientWon: business.firstClientWon || business.activeProjects.length > 0 || delivered.length > 0,
    reputation: Math.max(0, Math.min(100, (business.reputation ?? 50) + delivered.length * 0.4 - incidentPenalty * elapsedSeconds / 60)),
    clientSatisfaction: Math.max(0, Math.min(100, (business.clientSatisfaction ?? business.customerSatisfaction ?? 70) + delivered.length * 0.6 - incidentPenalty * elapsedSeconds / 90)),
    customerSatisfaction: Math.max(0, Math.min(100, (business.customerSatisfaction ?? business.clientSatisfaction ?? 70) + delivered.length * 0.6 - incidentPenalty * elapsedSeconds / 90)),
    lastDeliveredProjectId: delivered.length ? delivered[delivered.length - 1].id : business.lastDeliveredProjectId,
  };
  const hourlyRate = itHourlyProfit(next);
  return { business: { ...next, baseHourlyNetProfit: hourlyRate, hourlyNetProfit: hourlyRate }, hourlyRate, pendingAmount: (hourlyRate * elapsedSeconds) / 3600, cashDelta: Number(deliveredPayout.toFixed(2)), events };
}

export function startITProject(business: ITSoftwareData, specId: string, now: number): ITSoftwareData | null {
  const spec = IT_PROJECTS.find((item) => item.id === specId);
  if (!spec || !canUseITStage(business.companyStage, spec.minimumStage) || business.activeProjects.length >= business.projectSlots || business.activeProjects.some((project) => project.id === spec.id)) return null;
  const project: ITProjectState = { id: spec.id, phase: 'Scoping', budget: spec.budget, spent: 0, progress: 0, deadlineSeconds: spec.durationSeconds, startedAt: now, clientSatisfaction: business.clientSatisfaction ?? 70, developers: spec.developers, designers: spec.designers, qa: spec.qa };
  return { ...business, activeProjects: [...business.activeProjects, project], firstClientWon: true };
}

export function launchITProduct(business: ITSoftwareData, productId: string): ITSoftwareData | null {
  const spec = IT_PRODUCTS.find((item) => item.id === productId);
  if (!spec || !canUseITStage(business.companyStage, spec.minimumStage) || business.products.some((product) => product.id === spec.id)) return null;
  return { ...business, products: [...business.products, { id: spec.id, activeUsers: spec.startingUsers, churnRate: 0.018, monthlyRevenue: spec.startingUsers * spec.revenuePerUserPerHour * 720, supportCostPerHour: spec.startingUsers * spec.cloudUsersPerHour, launched: true }], activeSubscribers: business.activeSubscribers + spec.startingUsers };
}

export function hireITStaff(business: ITSoftwareData, role: 'developers' | 'designers' | 'qaStaff' | 'salesStaff' | 'managers'): ITSoftwareData {
  const salary: Record<typeof role, number> = { developers: 42, designers: 34, qaStaff: 30, salesStaff: 32, managers: 58 };
  return { ...business, [role]: business[role] + 1, payrollPerHour: business.payrollPerHour + salary[role] } as ITSoftwareData;
}

export function upgradeITOffice(business: ITSoftwareData): ITSoftwareData {
  const tier = Math.min(4, business.officeTier + 1) as ITSoftwareData['officeTier'];
  const capacity = business.officeCapacity + tier * 8;
  return { ...business, officeTier: tier, officeCapacity: capacity, projectSlots: Math.min(4, business.projectSlots + 1), cloudCapacity: business.cloudCapacity + tier * 15_000, serverCapacity: business.cloudCapacity + tier * 15_000 };
}

export function resolveITIncident(business: ITSoftwareData, incidentId: string): ITSoftwareData {
  return { ...business, activeIncidents: business.activeIncidents.map((incident) => incident.id === incidentId ? { ...incident, resolved: true, remainingSeconds: 0 } : incident), securityLevel: Math.min(5, business.securityLevel + 1), incidentRisk: Math.max(0, business.incidentRisk - 1) };
}

export { IT_CONTRACTS, IT_PROJECTS, IT_PRODUCTS };
