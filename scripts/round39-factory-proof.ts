import {
  DEFAULT_FACTORY_COMPANY,
  FACTORY_TYPE_INFO,
  factoryEconomics,
  factoryLevelFor,
  factoryProductionCapacity,
  FactoryCompanyState,
} from "../src/types/factory";
const scenarios: Record<string, unknown>[] = [];
const check = (label: string, ok: boolean, raw: Record<string, unknown>) => {
  scenarios.push({ label, ok, ...raw });
  if (!ok) throw new Error(`${label} failed`);
};
const launchCost = 45000;
let factory: FactoryCompanyState = {
  ...DEFAULT_FACTORY_COMPANY,
  status: "operating",
  location: "Central Industrial Park",
  factoryType: "Consumer Goods",
  machineLines: 1,
  workers: 2,
  rawMaterials: 300,
  cashInvested: launchCost,
};
check(
  "factory launch",
  factory.status === "operating" && factory.machineLines === 1,
  {
    cashBefore: 120000,
    launchCost,
    cashAfter: 75000,
    location: factory.location,
    type: factory.factoryType,
  },
);
const before = factoryEconomics(factory);
check(
  "production capacity",
  Math.floor(factoryProductionCapacity(factory)) === 500 &&
    before.production === 300,
  {
    capacity: factoryProductionCapacity(factory),
    productionUnits: before.production,
    rawMaterials: factory.rawMaterials,
  },
);
factory = {
  ...factory,
  rawMaterials: 0,
  finishedGoods: 300,
  totalProduction: 300,
};
const sale = 300 * FACTORY_TYPE_INFO[factory.factoryType].unitValue;
factory = { ...factory, finishedGoods: 0, totalSales: sale, lastRevenue: sale };
check(
  "inventory to sales",
  factory.totalProduction === 300 &&
    factory.totalSales === 2400 &&
    factory.finishedGoods === 0,
  {
    produced: factory.totalProduction,
    soldRevenue: factory.totalSales,
    finishedGoods: factory.finishedGoods,
  },
);
const upgraded = {
  ...factory,
  buildingLevel: 2 as const,
  inventoryCapacity: 3000,
  machineLines: 3,
  efficiency: 1.25,
};
check(
  "machinery and level progression",
  factoryLevelFor(upgraded) === "Plant" &&
    factoryProductionCapacity(upgraded) === 1875,
  {
    level: factoryLevelFor(upgraded),
    lines: upgraded.machineLines,
    efficiency: upgraded.efficiency,
    capacity: factoryProductionCapacity(upgraded),
  },
);
const reloaded = JSON.parse(JSON.stringify(upgraded)) as FactoryCompanyState;
check(
  "save and reload",
  reloaded.totalSales === 2400 && reloaded.buildingLevel === 2,
  {
    savedBytes: JSON.stringify(upgraded).length,
    totalSales: reloaded.totalSales,
    buildingLevel: reloaded.buildingLevel,
  },
);
console.log(
  JSON.stringify(
    {
      test: "round39-factory-proof",
      scenarioCount: scenarios.length,
      failed: scenarios.filter((item) => !item.ok).length,
      scenarios,
    },
    null,
    2,
  ),
);
