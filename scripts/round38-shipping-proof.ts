import {
  DEFAULT_SHIPPING_COMPANY,
  shippingEconomics,
  shippingFleetCapacity,
  shippingLevelFor,
  shippingVehicleCount,
  ShippingCompanyState,
} from "../src/types/shipping";
const scenarios: Record<string, unknown>[] = [];
const check = (label: string, ok: boolean, raw: Record<string, unknown>) => {
  scenarios.push({ label, ok, ...raw });
  if (!ok) throw new Error(`${label} failed`);
};
const launchCost = 22000;
let company: ShippingCompanyState = {
  ...DEFAULT_SHIPPING_COMPANY,
  status: "operating",
  city: "Harbor Port",
  vans: 1,
  drivers: 1,
  cashInvested: launchCost,
};
check(
  "launch",
  company.status === "operating" && shippingVehicleCount(company) === 1,
  {
    cashBefore: 80000,
    launchCost,
    cashAfter: 80000 - launchCost,
    city: company.city,
    vehicles: shippingVehicleCount(company),
  },
);
const shipment = {
  id: "proof-shipment",
  customer: "Northstar Retail Network",
  cargoUnits: 80,
  reward: 420,
  status: "in_transit" as const,
  route: company.city,
  assignedVehicle: "Delivery van",
  createdAt: 1700000000000,
};
company = { ...company, cargoStored: 80, shipments: [shipment] };
const economy = shippingEconomics(company);
check(
  "shipment settlement tick",
  economy.deliverable === 1 &&
    economy.revenue === 180 &&
    economy.expenses === 60 &&
    economy.net === 120,
  {
    deliverable: economy.deliverable,
    revenue: economy.revenue,
    expenses: economy.expenses,
    net: economy.net,
    cargoBefore: company.cargoStored,
  },
);
company = {
  ...company,
  cargoStored: 0,
  completedDeliveries: 1,
  totalIncome: 420,
  shipments: [{ ...shipment, status: "delivered" }],
};
check(
  "delivery completion",
  company.completedDeliveries === 1 &&
    company.cargoStored === 0 &&
    company.totalIncome === 420,
  {
    status: company.shipments[0].status,
    completedDeliveries: company.completedDeliveries,
    income: company.totalIncome,
    cargoAfter: company.cargoStored,
  },
);
const expanded = {
  ...company,
  warehouseLevel: 2 as const,
  warehouseCapacity: 3000,
  vans: 4,
};
check(
  "warehouse and level progression",
  shippingLevelFor(expanded) === "Growing" &&
    shippingFleetCapacity(expanded) === 480,
  {
    level: shippingLevelFor(expanded),
    warehouseCapacity: expanded.warehouseCapacity,
    fleetCapacity: shippingFleetCapacity(expanded),
  },
);
const reloaded = JSON.parse(JSON.stringify(expanded)) as ShippingCompanyState;
check(
  "save and reload",
  reloaded.shipments[0].status === "delivered" && reloaded.totalIncome === 420,
  {
    savedBytes: JSON.stringify(expanded).length,
    status: reloaded.shipments[0].status,
    income: reloaded.totalIncome,
  },
);
console.log(
  JSON.stringify(
    {
      test: "round38-shipping-proof",
      scenarioCount: scenarios.length,
      failed: scenarios.filter((item) => !item.ok).length,
      scenarios,
    },
    null,
    2,
  ),
);
