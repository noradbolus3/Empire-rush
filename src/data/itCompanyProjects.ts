import { ITCompanyStage, ITContractType } from '../types/itCompany';

export type ITProjectSpec = {
  id: string;
  name: string;
  client: string;
  minimumStage: ITCompanyStage;
  budget: number;
  payout: number;
  durationSeconds: number;
  developers: number;
  designers: number;
  qa: number;
  description: string;
};

export type ITContractSpec = {
  id: string;
  name: string;
  type: ITContractType;
  minimumStage: ITCompanyStage;
  value: number;
  deadlineSeconds: number;
  reputation: number;
  description: string;
};

export const IT_PROJECTS: ITProjectSpec[] = [
  { id: 'startup-mvp', name: 'Northstar MVP Build', client: 'Northstar Local', minimumStage: 'Startup Studio', budget: 12_000, payout: 19_500, durationSeconds: 12 * 60, developers: 2, designers: 1, qa: 1, description: 'A focused mobile MVP with a fast delivery window.' },
  { id: 'workflow-portal', name: 'Civic Workflow Portal', client: 'CivicWorks', minimumStage: 'Growing Company', budget: 55_000, payout: 92_000, durationSeconds: 28 * 60, developers: 4, designers: 1, qa: 2, description: 'A dependable operations portal with audit-ready reporting.' },
  { id: 'commerce-platform', name: 'Harbor Commerce Platform', client: 'Harborline Retail', minimumStage: 'Established Company', budget: 220_000, payout: 390_000, durationSeconds: 55 * 60, developers: 8, designers: 3, qa: 3, description: 'A high-volume commerce platform with uptime commitments.' },
  { id: 'global-data-suite', name: 'Atlas Data Intelligence Suite', client: 'Atlas Global', minimumStage: 'Technology Enterprise', budget: 950_000, payout: 1_850_000, durationSeconds: 120 * 60, developers: 20, designers: 6, qa: 8, description: 'A multi-region analytics rollout with strict compliance gates.' },
];

export const IT_CONTRACTS: ITContractSpec[] = [
  { id: 'local-retainer', name: 'Local Support Retainer', type: 'Startup', minimumStage: 'Startup Studio', value: 8_000, deadlineSeconds: 20 * 60, reputation: 2, description: 'Keep a first client productive with a compact support retainer.' },
  { id: 'regional-rollout', name: 'Regional Digital Rollout', type: 'Growth', minimumStage: 'Growing Company', value: 48_000, deadlineSeconds: 45 * 60, reputation: 5, description: 'A regional implementation with a demanding launch calendar.' },
  { id: 'enterprise-sla', name: 'Enterprise SLA Program', type: 'Enterprise', minimumStage: 'Established Company', value: 240_000, deadlineSeconds: 90 * 60, reputation: 12, description: 'High-value managed software operations with service-level penalties.' },
  { id: 'international-platform', name: 'International Platform Expansion', type: 'International', minimumStage: 'Technology Enterprise', value: 1_200_000, deadlineSeconds: 180 * 60, reputation: 25, description: 'A multi-office contract that opens international client demand.' },
];
