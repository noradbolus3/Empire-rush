export type TaxiCompanyStatus = "setup" | "operating";

export type TaxiArea = "Central City" | "Harbor District" | "Airport Corridor";

export type TaxiCompanyState = {
  id: "empire-taxi-company";
  name: string;
  status: TaxiCompanyStatus;
  area: TaxiArea;
  depotLevel: 1 | 2 | 3;
  economyTaxis: number;
  electricTaxis: number;
  luxuryTaxis: number;
  drivers: number;
  cashInvested: number;
  completedRides: number;
  demandIndex: number;
  fleetCondition: number;
  expansionLevel: number;
  lastShiftAt: number;
  lastShiftRevenue: number;
  lastShiftExpenses: number;
};

export const DEFAULT_TAXI_COMPANY: TaxiCompanyState = {
  id: "empire-taxi-company",
  name: "Empire Taxi Co.",
  status: "setup",
  area: "Central City",
  depotLevel: 1,
  economyTaxis: 0,
  electricTaxis: 0,
  luxuryTaxis: 0,
  drivers: 0,
  cashInvested: 0,
  completedRides: 0,
  demandIndex: 1,
  fleetCondition: 100,
  expansionLevel: 1,
  lastShiftAt: 0,
  lastShiftRevenue: 0,
  lastShiftExpenses: 0,
};

export function taxiVehicleCount(company: TaxiCompanyState) {
  return company.economyTaxis + company.electricTaxis + company.luxuryTaxis;
}

export function taxiCapacity(company: TaxiCompanyState) {
  return company.depotLevel * 10;
}

export function taxiHourlyEconomics(company: TaxiCompanyState) {
  const rides =
    company.economyTaxis * 7 +
    company.electricTaxis * 9 +
    company.luxuryTaxis * 12;
  const revenue = rides * 18 * company.demandIndex;
  const expenses =
    company.drivers * 22 +
    taxiVehicleCount(company) * 8 +
    (100 - company.fleetCondition) * 2;
  return { revenue, expenses, net: revenue - expenses, rides };
}
