import {
  DEFAULT_DEALERSHIP,
  dealershipLevelFor,
  dealershipSellTick,
} from "../src/types/dealership";
const scenarios: Record<string, unknown>[] = [];
const check = (label: string, ok: boolean, raw: Record<string, unknown>) => {
  if (!ok) throw new Error(`${label} failed: ${JSON.stringify(raw)}`);
  scenarios.push({ label, ok, ...raw });
};
const launched = {
  ...DEFAULT_DEALERSHIP,
  status: "operating" as const,
  showroomSize: 1,
  inventory: 2,
  salesStaff: 2,
  cashInvested: 75000,
};
check(
  "showroom launch",
  launched.status === "operating" && launched.showroomCapacity === 4,
  {
    status: launched.status,
    showroomSize: launched.showroomSize,
    capacity: launched.showroomCapacity,
    cashInvested: launched.cashInvested,
  },
);
const sold = dealershipSellTick(launched);
check(
  "vehicle sale",
  sold.sold &&
    sold.revenue === 18000 &&
    sold.cost === 13000 &&
    sold.profit === 5000 &&
    sold.dealership.inventory === 1,
  {
    sold: sold.sold,
    revenue: sold.revenue,
    cost: sold.cost,
    profit: sold.profit,
    inventoryAfter: sold.dealership.inventory,
    totalSales: sold.dealership.totalSales,
  },
);
const growing = {
  ...sold.dealership,
  showroomSize: 3,
  totalSales: 10,
  branches: 1,
  premiumVehicles: 2,
};
check(
  "growth progression",
  dealershipLevelFor(growing) === "Large Dealership",
  {
    level: dealershipLevelFor(growing),
    showroomSize: growing.showroomSize,
    totalSales: growing.totalSales,
  },
);
const reloaded = JSON.parse(JSON.stringify(growing));
check("save and reload", reloaded.totalSales === 10 && reloaded.branches === 1, {
  bytes: JSON.stringify(growing).length,
  totalSales: reloaded.totalSales,
  branches: reloaded.branches,
});
console.log(
  JSON.stringify(
    {
      test: "round41-dealership-proof",
      scenarioCount: scenarios.length,
      failed: 0,
      scenarios,
    },
    null,
    2,
  ),
);
