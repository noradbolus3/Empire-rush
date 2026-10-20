export type SoftwareStatus = "setup" | "operating";
export type SoftwareStage =
  "Startup" | "Growing Company" | "Established Firm" | "Technology Enterprise";
export type SoftwareCompanyState = {
  id: "empire-software-company";
  name: string;
  status: SoftwareStatus;
  stage: SoftwareStage;
  officeType: string;
  developers: number;
  designers: number;
  qaEngineers: number;
  managers: number;
  activeProjects: number;
  deliveredProjects: number;
  clientContracts: number;
  saasProducts: number;
  subscribers: number;
  cloudSpend: number;
  cashInvested: number;
  revenue: number;
  expenses: number;
  clientSatisfaction: number;
  offices: number;
};
export const DEFAULT_SOFTWARE_COMPANY: SoftwareCompanyState = {
  id: "empire-software-company",
  name: "Empire Software Labs",
  status: "setup",
  stage: "Startup",
  officeType: "Home studio",
  developers: 0,
  designers: 0,
  qaEngineers: 0,
  managers: 0,
  activeProjects: 0,
  deliveredProjects: 0,
  clientContracts: 0,
  saasProducts: 0,
  subscribers: 0,
  cloudSpend: 0,
  cashInvested: 0,
  revenue: 0,
  expenses: 0,
  clientSatisfaction: 80,
  offices: 0,
};
export function softwareStageFor(s: SoftwareCompanyState): SoftwareStage {
  if (s.offices >= 3 && s.saasProducts >= 2 && s.managers >= 4)
    return "Technology Enterprise";
  if (s.offices >= 2 && s.managers >= 2 && s.deliveredProjects >= 8)
    return "Established Firm";
  if (s.developers >= 4 && s.activeProjects >= 2 && s.deliveredProjects >= 2)
    return "Growing Company";
  return "Startup";
}
export function softwareSettlementTick(s: SoftwareCompanyState) {
  const delivery =
    s.status === "operating" && s.activeProjects > 0 && s.developers > 0;
  const revenue = delivery
    ? 12000 + s.clientContracts * 1000 + s.subscribers * 5
    : 0;
  const expenses =
    s.developers * 160 +
    s.designers * 130 +
    s.qaEngineers * 140 +
    s.managers * 220 +
    s.cloudSpend +
    (s.offices ? 500 : 0);
  const next = {
    ...s,
    activeProjects: delivery
      ? Math.max(0, s.activeProjects - 1)
      : s.activeProjects,
    deliveredProjects: s.deliveredProjects + (delivery ? 1 : 0),
    revenue: s.revenue + revenue,
    expenses: s.expenses + expenses,
    stage: softwareStageFor({
      ...s,
      deliveredProjects: s.deliveredProjects + (delivery ? 1 : 0),
    }),
  };
  return {
    company: next,
    revenue,
    expenses,
    profit: revenue - expenses,
    delivered: delivery,
  };
}
