export type FactoryStatus = "setup" | "operating";
export type FactoryType = "Consumer Goods" | "Industrial Parts" | "Electronics";
export type FactoryLocation =
  "Central Industrial Park" | "Harbor Manufacturing Zone" | "Tech Corridor";
export type FactoryLevel =
  "Workshop" | "Plant" | "Industrial Group" | "Manufacturing Conglomerate";
export type ProductionStatus = "queued" | "running" | "finished";

export type FactoryProductionOrder = {
  id: string;
  product: string;
  units: number;
  value: number;
  status: ProductionStatus;
  createdAt: number;
};

export type FactoryCompanyState = {
  id: "empire-factory-company";
  name: string;
  status: FactoryStatus;
  factoryType: FactoryType;
  location: FactoryLocation;
  level: FactoryLevel;
  buildingLevel: 1 | 2 | 3 | 4;
  machineLines: number;
  machineCapacity: number;
  rawMaterials: number;
  finishedGoods: number;
  inventoryCapacity: number;
  workers: number;
  supervisors: number;
  maintenanceTeam: number;
  cashInvested: number;
  totalProduction: number;
  totalSales: number;
  totalExpenses: number;
  machineCondition: number;
  efficiency: number;
  demandIndex: number;
  orders: FactoryProductionOrder[];
  lastProductionAt: number;
  lastRevenue: number;
  lastExpenses: number;
};

export const DEFAULT_FACTORY_COMPANY: FactoryCompanyState = {
  id: "empire-factory-company",
  name: "Empire Manufacturing Co.",
  status: "setup",
  factoryType: "Consumer Goods",
  location: "Central Industrial Park",
  level: "Workshop",
  buildingLevel: 1,
  machineLines: 0,
  machineCapacity: 500,
  rawMaterials: 0,
  finishedGoods: 0,
  inventoryCapacity: 1000,
  workers: 0,
  supervisors: 0,
  maintenanceTeam: 0,
  cashInvested: 0,
  totalProduction: 0,
  totalSales: 0,
  totalExpenses: 0,
  machineCondition: 100,
  efficiency: 1,
  demandIndex: 1,
  orders: [],
  lastProductionAt: 0,
  lastRevenue: 0,
  lastExpenses: 0,
};

export const FACTORY_TYPE_INFO: Record<
  FactoryType,
  { product: string; unitValue: number; rawPerUnit: number }
> = {
  "Consumer Goods": {
    product: "Household product",
    unitValue: 8,
    rawPerUnit: 1,
  },
  "Industrial Parts": {
    product: "Industrial component",
    unitValue: 18,
    rawPerUnit: 1.4,
  },
  Electronics: { product: "Smart device", unitValue: 42, rawPerUnit: 2 },
};

export function factoryLevelFor(factory: FactoryCompanyState): FactoryLevel {
  if (factory.buildingLevel >= 4 && factory.machineLines >= 12)
    return "Manufacturing Conglomerate";
  if (factory.buildingLevel >= 3 && factory.machineLines >= 6)
    return "Industrial Group";
  if (factory.buildingLevel >= 2 || factory.machineLines >= 3) return "Plant";
  return "Workshop";
}
export function factoryProductionCapacity(factory: FactoryCompanyState) {
  return factory.machineLines * factory.machineCapacity * factory.efficiency;
}
export function factoryEconomics(factory: FactoryCompanyState) {
  const info = FACTORY_TYPE_INFO[factory.factoryType];
  const possible = Math.min(
    factory.rawMaterials / info.rawPerUnit,
    factoryProductionCapacity(factory),
  );
  const production = Math.floor(
    Math.max(
      0,
      Math.min(possible, factory.inventoryCapacity - factory.finishedGoods),
    ),
  );
  const sales = Math.floor(
    Math.min(
      factory.finishedGoods,
      production * 0.7 + factory.demandIndex * 25,
    ),
  );
  const revenue = sales * info.unitValue * factory.demandIndex;
  const expenses =
    factory.workers * 42 +
    factory.supervisors * 70 +
    factory.maintenanceTeam * 55 +
    factory.machineLines * 30 +
    (100 - factory.machineCondition) * 4;
  return {
    production,
    sales,
    revenue,
    expenses,
    net: revenue - expenses,
    product: info.product,
  };
}

export function factorySettlementTick(factory: FactoryCompanyState, cash = 0) {
  const info = FACTORY_TYPE_INFO[factory.factoryType];
  const production = Math.floor(
    Math.max(
      0,
      Math.min(
        factory.rawMaterials / info.rawPerUnit,
        factoryProductionCapacity(factory),
        factory.inventoryCapacity - factory.finishedGoods,
      ),
    ),
  );
  const finishedBeforeSales = factory.finishedGoods + production;
  const sales = Math.floor(
    Math.min(finishedBeforeSales, production * 0.7 + factory.demandIndex * 25),
  );
  const revenue = sales * info.unitValue * factory.demandIndex;
  const expenses =
    factory.workers * 42 +
    factory.supervisors * 70 +
    factory.maintenanceTeam * 55 +
    factory.machineLines * 30 +
    (100 - factory.machineCondition) * 4;
  const nextFactory: FactoryCompanyState = {
    ...factory,
    level: factoryLevelFor(factory),
    rawMaterials: factory.rawMaterials - production * info.rawPerUnit,
    finishedGoods: finishedBeforeSales - sales,
    totalProduction: factory.totalProduction + production,
    totalSales: factory.totalSales + revenue,
    totalExpenses: factory.totalExpenses + expenses,
    lastProductionAt: Date.now(),
    lastRevenue: revenue,
    lastExpenses: expenses,
  };
  return {
    factory: nextFactory,
    cashBefore: cash,
    cashAfter: cash + revenue - expenses,
    cashDelta: revenue - expenses,
    production,
    sales,
    revenue,
    expenses,
  };
}

export function factoryUnitsLabel(factory: FactoryCompanyState) {
  return `${factory.finishedGoods.toLocaleString()} finished / ${factory.rawMaterials.toLocaleString()} raw`;
}
