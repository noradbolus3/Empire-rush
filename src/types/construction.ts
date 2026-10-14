export type ConstructionStatus = "setup" | "operating";
export type ConstructionProjectType =
  "Residential" | "Commercial" | "Industrial";
export type ConstructionLevel =
  "Small Contractor" | "Growing Company" | "Large Company" | "Enterprise";
export type ConstructionCompanyState = {
  id: "empire-construction-company";
  name: string;
  status: ConstructionStatus;
  projectType: ConstructionProjectType;
  landLocation: string;
  level: ConstructionLevel;
  landParcels: number;
  activeProjects: number;
  completedProjects: number;
  workers: number;
  excavators: number;
  cranes: number;
  mixers: number;
  materials: number;
  progress: number;
  contractValue: number;
  cashInvested: number;
  revenue: number;
  expenses: number;
};
export const DEFAULT_CONSTRUCTION_COMPANY: ConstructionCompanyState = {
  id: "empire-construction-company",
  name: "Empire Development & Construction",
  status: "setup",
  projectType: "Residential",
  landLocation: "Metro North District",
  level: "Small Contractor",
  landParcels: 0,
  activeProjects: 0,
  completedProjects: 0,
  workers: 0,
  excavators: 0,
  cranes: 0,
  mixers: 0,
  materials: 0,
  progress: 0,
  contractValue: 0,
  cashInvested: 0,
  revenue: 0,
  expenses: 0,
};
export function constructionLevelFor(
  c: ConstructionCompanyState,
): ConstructionLevel {
  if (c.landParcels >= 8 && c.activeProjects >= 5 && c.cranes >= 4)
    return "Enterprise";
  if (c.landParcels >= 4 && c.activeProjects >= 2) return "Large Company";
  if (c.landParcels >= 2 || c.activeProjects >= 1) return "Growing Company";
  return "Small Contractor";
}
export function constructionTick(c: ConstructionCompanyState, cash = 0) {
  const progress = Math.min(
    100,
    c.progress + c.workers * 2 + c.excavators * 3 + c.mixers * 2,
  );
  const complete = c.activeProjects > 0 && progress >= 100;
  const revenue = complete ? c.contractValue : 0;
  const expenses =
    c.workers * 55 +
    c.excavators * 90 +
    c.cranes * 120 +
    c.mixers * 45 +
    (c.activeProjects ? 150 : 0);
  const next = {
    ...c,
    level: constructionLevelFor(c),
    progress: complete ? 0 : progress,
    activeProjects: complete
      ? Math.max(0, c.activeProjects - 1)
      : c.activeProjects,
    completedProjects: c.completedProjects + (complete ? 1 : 0),
    revenue: c.revenue + revenue,
    expenses: c.expenses + expenses,
  };
  return {
    company: next,
    cashBefore: cash,
    revenue,
    expenses,
    cashDelta: revenue - expenses,
    cashAfter: cash + revenue - expenses,
    completed: complete,
  };
}
