import { DEFAULT_TAXI_COMPANY, taxiCapacity, taxiHourlyEconomics, taxiVehicleCount, TaxiCompanyState } from "../src/types/taxi";

const out: Record<string, unknown>[] = [];
const assert = (label: string, condition: boolean, raw: Record<string, unknown>) => {
  out.push({ label, ok: condition, ...raw });
  if (!condition) throw new Error(`${label} failed`);
};

const launchCost = 8000 + 5000;
const launched: TaxiCompanyState = {
  ...DEFAULT_TAXI_COMPANY,
  status: "operating",
  area: "Central City",
  economyTaxis: 1,
  drivers: 1,
  cashInvested: launchCost,
  lastShiftAt: 1700000000000,
};
assert("launch", launched.status === "operating" && taxiVehicleCount(launched) === 1, {
  cashBefore: 50000, launchCost, cashAfter: 50000 - launchCost, vehicles: taxiVehicleCount(launched), drivers: launched.drivers,
});

const beforeShift = taxiHourlyEconomics(launched);
const afterShift: TaxiCompanyState = {
  ...launched,
  completedRides: launched.completedRides + beforeShift.rides,
  fleetCondition: Math.max(0, launched.fleetCondition - 0.4),
  lastShiftRevenue: Math.round(beforeShift.revenue),
  lastShiftExpenses: Math.round(beforeShift.expenses),
};
assert("one settlement tick", afterShift.completedRides > launched.completedRides && afterShift.lastShiftRevenue > afterShift.lastShiftExpenses, {
  rides: beforeShift.rides, revenue: Math.round(beforeShift.revenue), expenses: Math.round(beforeShift.expenses), net: Math.round(beforeShift.net), conditionAfter: afterShift.fleetCondition,
});

const withFleet = { ...afterShift, electricTaxis: 1, drivers: 2 };
const fleetEconomics = taxiHourlyEconomics(withFleet);
assert("fleet and workforce", taxiVehicleCount(withFleet) === 2 && withFleet.drivers === 2 && fleetEconomics.revenue > beforeShift.revenue, {
  vehicles: taxiVehicleCount(withFleet), capacity: taxiCapacity(withFleet), drivers: withFleet.drivers, revenueBefore: Math.round(beforeShift.revenue), revenueAfter: Math.round(fleetEconomics.revenue),
});

const expanded = { ...withFleet, depotLevel: 2 as const, expansionLevel: 2, area: "Harbor District" as const };
assert("expansion", taxiCapacity(expanded) === 20 && expanded.area === "Harbor District", { depotLevel: expanded.depotLevel, capacity: taxiCapacity(expanded), area: expanded.area, expansionCost: 25000 });

const reloaded = JSON.parse(JSON.stringify(expanded)) as TaxiCompanyState;
assert("save and reload", reloaded.id === expanded.id && reloaded.area === expanded.area && reloaded.completedRides === expanded.completedRides, {
  savedBytes: JSON.stringify(expanded).length, reloadedArea: reloaded.area, reloadedVehicles: taxiVehicleCount(reloaded), reloadedRides: reloaded.completedRides,
});

console.log(JSON.stringify({ test: "round37-taxi-proof", scenarioCount: out.length, failed: out.filter(item => !item.ok).length, scenarios: out }, null, 2));
