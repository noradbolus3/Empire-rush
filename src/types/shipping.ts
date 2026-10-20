export type ShippingCompanyStatus = "setup" | "operating";
export type ShippingCity =
  "Central Hub" | "Harbor Port" | "Airport Logistics Zone";
export type ShipmentStatus =
  "pending" | "assigned" | "in_transit" | "delivered" | "delayed";
export type ShippingLevel = "Small" | "Growing" | "Large" | "Enterprise";

export type ShippingShipment = {
  id: string;
  customer: string;
  cargoUnits: number;
  reward: number;
  status: ShipmentStatus;
  route: ShippingCity;
  assignedVehicle?: string;
  createdAt: number;
};

export type ShippingCompanyState = {
  id: "empire-shipping-company";
  name: string;
  status: ShippingCompanyStatus;
  city: ShippingCity;
  level: ShippingLevel;
  warehouseLevel: 1 | 2 | 3 | 4;
  warehouseCapacity: number;
  cargoStored: number;
  vans: number;
  trucks: number;
  drivers: number;
  warehouseStaff: number;
  dispatchers: number;
  cashInvested: number;
  completedDeliveries: number;
  totalIncome: number;
  totalExpenses: number;
  fleetCondition: number;
  demandIndex: number;
  shipments: ShippingShipment[];
  lastShiftAt: number;
  lastShiftRevenue: number;
  lastShiftExpenses: number;
};

export const DEFAULT_SHIPPING_COMPANY: ShippingCompanyState = {
  id: "empire-shipping-company",
  name: "Empire Shipping Co.",
  status: "setup",
  city: "Central Hub",
  level: "Small",
  warehouseLevel: 1,
  warehouseCapacity: 1000,
  cargoStored: 0,
  vans: 0,
  trucks: 0,
  drivers: 0,
  warehouseStaff: 0,
  dispatchers: 0,
  cashInvested: 0,
  completedDeliveries: 0,
  totalIncome: 0,
  totalExpenses: 0,
  fleetCondition: 100,
  demandIndex: 1,
  shipments: [],
  lastShiftAt: 0,
  lastShiftRevenue: 0,
  lastShiftExpenses: 0,
};

export function shippingVehicleCount(company: ShippingCompanyState) {
  return company.vans + company.trucks;
}
export function shippingFleetCapacity(company: ShippingCompanyState) {
  return company.vans * 120 + company.trucks * 500;
}
export function shippingLevelFor(company: ShippingCompanyState): ShippingLevel {
  if (company.warehouseLevel >= 4 && company.trucks >= 10) return "Enterprise";
  if (company.warehouseLevel >= 3 && company.trucks >= 4) return "Large";
  if (company.warehouseLevel >= 2 || company.vans >= 4) return "Growing";
  return "Small";
}
export function shippingEconomics(company: ShippingCompanyState) {
  const active = company.shipments.filter(
    (shipment) => shipment.status !== "delivered",
  ).length;
  const deliverable = Math.min(
    active,
    company.drivers,
    shippingVehicleCount(company),
  );
  const revenue = deliverable * 180 * company.demandIndex;
  const expenses =
    company.drivers * 38 +
    company.warehouseStaff * 28 +
    company.dispatchers * 45 +
    shippingVehicleCount(company) * 22 +
    (100 - company.fleetCondition) * 3;
  return { active, deliverable, revenue, expenses, net: revenue - expenses };
}
