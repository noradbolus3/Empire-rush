export type AirlineTab = "dashboard" | "fleet" | "routes" | "ticketing" | "maintenance" | "crew" | "expansion";
export type AirlineStage = "Regional Airline" | "Growing Airline" | "National Airline" | "Global Airline Group";
export type AirlineState = {
  schemaVersion: number; id: "airline-company"; companyName: string; stage: AirlineStage;
  cashReserve: number; fuelPrice: number; passengerDemand: number; aircraft: number; seats: number;
  flightHours: number; routes: number; hubs: number; flightsPerDay: number; ticketPrice: number;
  occupancy: number; passengerSatisfaction: number; maintenanceLevel: number; crew: number;
  premiumServices: number; internationalRoutes: number; delays: number; cancellations: number;
  revenueToDate: number; operatingCostToDate: number; lastEvent: string;
};
export const AIRLINE_SCHEMA_VERSION = 1;
export const DEFAULT_AIRLINE: AirlineState = {
  schemaVersion: 1, id: "airline-company", companyName: "Northstar Air Group", stage: "Regional Airline",
  cashReserve: 0, fuelPrice: 3.4, passengerDemand: 100, aircraft: 0, seats: 0, flightHours: 0,
  routes: 0, hubs: 1, flightsPerDay: 0, ticketPrice: 145, occupancy: 68, passengerSatisfaction: 88,
  maintenanceLevel: 1, crew: 0, premiumServices: 0, internationalRoutes: 0, delays: 0, cancellations: 0,
  revenueToDate: 0, operatingCostToDate: 0, lastEvent: "Airline charter ready · acquire an aircraft to schedule your first route.",
};
