export type DealershipStatus = "setup" | "operating";
export type DealershipLevel =
  "Small Dealer" | "Growing Dealer" | "Large Dealership" | "Automobile Group";
export type DealershipState = {
  id: "empire-car-dealership";
  name: string;
  status: DealershipStatus;
  level: DealershipLevel;
  location: string;
  showroomSize: number;
  inventory: number;
  showroomCapacity: number;
  totalSales: number;
  revenue: number;
  profit: number;
  salesStaff: number;
  customerSatisfaction: number;
  branches: number;
  premiumVehicles: number;
  cashInvested: number;
};
export const DEFAULT_DEALERSHIP: DealershipState = {
  id: "empire-car-dealership",
  name: "Empire Motors Dealership",
  status: "setup",
  level: "Small Dealer",
  location: "Metro North Auto Row",
  showroomSize: 0,
  inventory: 0,
  showroomCapacity: 4,
  totalSales: 0,
  revenue: 0,
  profit: 0,
  salesStaff: 0,
  customerSatisfaction: 80,
  branches: 0,
  premiumVehicles: 0,
  cashInvested: 0,
};
export function dealershipLevelFor(d: DealershipState): DealershipLevel {
  if (d.branches >= 4 && d.premiumVehicles >= 5) return "Automobile Group";
  if (d.showroomSize >= 3 && d.totalSales >= 10) return "Large Dealership";
  if (d.showroomSize >= 1 && d.totalSales >= 2) return "Growing Dealer";
  return "Small Dealer";
}
export function dealershipSellTick(d: DealershipState) {
  const canSell = d.status === "operating" && d.inventory > 0;
  const revenue = canSell ? (d.premiumVehicles > 0 ? 32000 : 18000) : 0;
  const cost = canSell ? (d.premiumVehicles > 0 ? 24000 : 13000) : 0;
  const next = {
    ...d,
    inventory: canSell ? d.inventory - 1 : d.inventory,
    totalSales: d.totalSales + (canSell ? 1 : 0),
    revenue: d.revenue + revenue,
    profit: d.profit + revenue - cost,
    level: dealershipLevelFor({
      ...d,
      totalSales: d.totalSales + (canSell ? 1 : 0),
    }),
  };
  return {
    dealership: next,
    revenue,
    cost,
    profit: revenue - cost,
    sold: canSell,
  };
}
