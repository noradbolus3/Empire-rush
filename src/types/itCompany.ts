export type ITCompanyStage =
  | 'Startup Studio'
  | 'Growing Company'
  | 'Established Company'
  | 'Technology Enterprise';

export type ITProjectPhase = 'Scoping' | 'Development' | 'QA' | 'Delivered' | 'At Risk';
export type ITContractType = 'Startup' | 'Growth' | 'Enterprise' | 'International';

export interface ITProjectState {
  id: string;
  phase: ITProjectPhase;
  budget: number;
  spent: number;
  progress: number;
  deadlineSeconds: number;
  startedAt: number;
  clientSatisfaction: number;
  developers: number;
  designers: number;
  qa: number;
}

export interface ITClientContractState {
  id: string;
  type: ITContractType;
  value: number;
  deadlineSeconds: number;
  satisfaction: number;
  active: boolean;
}

export interface ITProductState {
  id: string;
  activeUsers: number;
  churnRate: number;
  monthlyRevenue: number;
  supportCostPerHour: number;
  launched: boolean;
}

export interface ITIncidentState {
  id: string;
  kind: 'Outage' | 'Security breach' | 'Compliance review';
  severity: 1 | 2 | 3;
  resolved: boolean;
  remainingSeconds: number;
}

export interface ITOfficeState {
  id: string;
  city: string;
  capacity: number;
  operatingCostPerHour: number;
  open: boolean;
}

export interface ITSoftwareState {
  companyStage: ITCompanyStage;
  officeTier: 1 | 2 | 3 | 4;
  officeCapacity: number;
  offices: ITOfficeState[];
  developers: number;
  designers: number;
  qaStaff: number;
  salesStaff: number;
  managers: number;
  payrollPerHour: number;
  projectSlots: number;
  activeProjects: ITProjectState[];
  clientContracts: ITClientContractState[];
  products: ITProductState[];
  cloudCapacity: number;
  cloudUsage: number;
  cloudCostPerHour: number;
  securityLevel: number;
  incidentRisk: number;
  activeIncidents: ITIncidentState[];
  researchBudgetPerHour: number;
  internationalOffices: number;
  clientSatisfaction: number;
  formationComplete: boolean;
  firstClientWon: boolean;
  lastDeliveredProjectId?: string;
  totalProjectsDelivered: number;
  totalContractRevenue: number;
  /** Legacy fields retained for save compatibility and old calculations. */
  activeSubscribers: number;
  serverCapacity: number;
  openBugs: number;
}

export const IT_STAGE_ORDER: ITCompanyStage[] = [
  'Startup Studio',
  'Growing Company',
  'Established Company',
  'Technology Enterprise',
];

export const IT_STAGE_THRESHOLDS: Record<ITCompanyStage, number> = {
  'Startup Studio': 75_000,
  'Growing Company': 250_000,
  'Established Company': 1_000_000,
  'Technology Enterprise': 10_000_000,
};
