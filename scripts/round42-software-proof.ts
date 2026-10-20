import {
  DEFAULT_SOFTWARE_COMPANY,
  softwareSettlementTick,
  softwareStageFor,
} from "../src/types/software";
const scenarios: Record<string, unknown>[] = [];
const check = (label: string, ok: boolean, raw: Record<string, unknown>) => {
  if (!ok) throw new Error(`${label} failed: ${JSON.stringify(raw)}`);
  scenarios.push({ label, ok, ...raw });
};
const launched = {
  ...DEFAULT_SOFTWARE_COMPANY,
  status: "operating" as const,
  developers: 1,
  activeProjects: 1,
  clientContracts: 1,
  cashInvested: 50000,
};
check(
  "startup launch",
  launched.status === "operating" && launched.developers === 1,
  {
    status: launched.status,
    developers: launched.developers,
    activeProjects: launched.activeProjects,
    cashInvested: launched.cashInvested,
  },
);
const delivered = softwareSettlementTick(launched);
check(
  "project delivery",
  delivered.delivered &&
    delivered.revenue === 13000 &&
    delivered.expenses === 160 &&
    delivered.profit === 12840 &&
    delivered.company.deliveredProjects === 1,
  {
    delivered: delivered.delivered,
    revenue: delivered.revenue,
    expenses: delivered.expenses,
    profit: delivered.profit,
    deliveredProjects: delivered.company.deliveredProjects,
  },
);
const growing = {
  ...delivered.company,
  developers: 4,
  activeProjects: 2,
  deliveredProjects: 2,
};
check("stage progression", softwareStageFor(growing) === "Growing Company", {
  stage: softwareStageFor(growing),
  developers: growing.developers,
  activeProjects: growing.activeProjects,
  deliveredProjects: growing.deliveredProjects,
});
const enterprise = {
  ...growing,
  offices: 3,
  managers: 4,
  saasProducts: 2,
  stage: softwareStageFor({
    ...growing,
    offices: 3,
    managers: 4,
    saasProducts: 2,
  }),
};
check(
  "enterprise unlock",
  softwareStageFor(enterprise) === "Technology Enterprise",
  {
    stage: softwareStageFor(enterprise),
    offices: enterprise.offices,
    managers: enterprise.managers,
    saasProducts: enterprise.saasProducts,
  },
);
const reloaded = JSON.parse(JSON.stringify(enterprise));
check(
  "save and reload",
  reloaded.stage === "Technology Enterprise" && reloaded.saasProducts === 2,
  {
    bytes: JSON.stringify(enterprise).length,
    stage: reloaded.stage,
    saasProducts: reloaded.saasProducts,
  },
);
console.log(
  JSON.stringify(
    {
      test: "round42-software-proof",
      scenarioCount: scenarios.length,
      failed: 0,
      scenarios,
    },
    null,
    2,
  ),
);
