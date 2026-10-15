import { ITCompanyStage } from '../types/itCompany';

export type ITProductSpec = {
  id: string;
  name: string;
  minimumStage: ITCompanyStage;
  launchCost: number;
  startingUsers: number;
  revenuePerUserPerHour: number;
  cloudUsersPerHour: number;
  description: string;
};

export const IT_PRODUCTS: ITProductSpec[] = [
  { id: 'flowdesk', name: 'FlowDesk Operations', minimumStage: 'Growing Company', launchCost: 75_000, startingUsers: 700, revenuePerUserPerHour: 0.24, cloudUsersPerHour: 0.015, description: 'Recurring workflow subscriptions for small operators.' },
  { id: 'ledgercloud', name: 'LedgerCloud Finance', minimumStage: 'Established Company', launchCost: 300_000, startingUsers: 2_500, revenuePerUserPerHour: 0.38, cloudUsersPerHour: 0.022, description: 'A compliance-ready finance platform for growing companies.' },
  { id: 'atlasai', name: 'AtlasAI Intelligence', minimumStage: 'Technology Enterprise', launchCost: 1_200_000, startingUsers: 8_000, revenuePerUserPerHour: 0.55, cloudUsersPerHour: 0.032, description: 'An enterprise intelligence suite with global demand.' },
];
