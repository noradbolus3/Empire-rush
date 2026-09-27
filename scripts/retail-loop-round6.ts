import { DEFAULT_BUSINESSES, simulateBusinessOperations } from '../src/engine/businessSimulation';
import { RetailData } from '../src/types/business';
import { STARTING_CASH } from '../src/engine/economyPlan';
import { settleElapsedBusinessIncome } from '../src/engine/settlementEngine';

 type Snapshot = { checkpoint: string; orders: number; salesUnits: number; cashflow: number; cash: number; netWorth: number; minNetWorth: number; autoRestock: boolean; demandEvents: number; flag: string };
const retail = { ...DEFAULT_BUSINESSES.find(item => item.sector === 'Retail')! } as RetailData;
let business: RetailData = { ...retail, isAcquired: true, stockUnits: 0, onboardingStep: 'ORDER_STOCK' };
let cash = STARTING_CASH;
let orders = 0;
let salesUnits = 0;
let cashflow = 0;
let demandEvents = 0;
let autoRestock = false;
let minNetWorth = STARTING_CASH;
let settlementSeconds = 0; let settlementCursor = 0;
const snapshots: Snapshot[] = [];
const checkpoints = new Map([[10 * 60, '10 minutes'], [60 * 60, '1 hour'], [24 * 60 * 60, '1 day']]);
function netWorth() { return cash + business.acquisitionCost + business.stockUnits * (business.unitWholesaleCost ?? 2) + (business.pendingSettlementAmount ?? 0) + (autoRestock ? 250 : 0); }
function orderStock(units: number, cost: number) { if (cash < cost || business.stockUnits + units > business.maxStockCapacity) return false; cash -= cost; business = { ...business, stockUnits: business.stockUnits + units, onboardingStep: business.onboardingStep === 'ORDER_STOCK' ? 'WATCH_FIRST_SALE' : business.onboardingStep, unitWholesaleCost: cost / units }; orders += 1; return true; }
cash -= retail.acquisitionCost;
orderStock(250, 500);
for (let elapsed = 2; elapsed <= 24 * 60 * 60; elapsed += 2) {
  if (!autoRestock && cash >= 250 && elapsed <= 15 * 60) { cash -= 250; autoRestock = true; business = { ...business, autoRestockEnabled: true }; }
  const beforeStock = business.stockUnits;
  const result = simulateBusinessOperations([business], 2, 2, cash);
  business = result.businesses[0] as RetailData;
  const sold = beforeStock - business.stockUnits;
  salesUnits += Math.max(0, sold);
  settlementSeconds += 2;
  if (settlementSeconds >= 3600) {
    const settlement = settleElapsedBusinessIncome([business], settlementCursor, elapsed * 1000);
    const credit = settlement.totalAmount;
    cash = Math.max(0, cash + credit);
    cashflow += credit;
    settlementCursor = settlement.nextSettlementAtMs;
    business = { ...business, pendingSettlementAmount: 0, settlementAccruedSeconds: 0 };
    settlementSeconds -= settlement.completedHours * 3600;
  }
  demandEvents += result.events.filter(event => event.includes('demand pulse activated')).length;
  const label = checkpoints.get(elapsed);
  minNetWorth = Math.min(minNetWorth, netWorth());
  if (label) snapshots.push({ checkpoint: label, orders, salesUnits, cashflow: Number(cashflow.toFixed(2)), cash: Number(cash.toFixed(2)), netWorth: Number(netWorth().toFixed(2)), minNetWorth: Number(minNetWorth.toFixed(2)), autoRestock, demandEvents, flag: minNetWorth < STARTING_CASH ? 'FAIL: net worth fell' : 'PASS' });
}
console.log(JSON.stringify({ startingCash: STARTING_CASH, initialBusinessPurchase: retail.acquisitionCost, initialOrder: '$500 for 250 units', settlement: 'whole-hour business credit; no per-tick cash', snapshots }, null, 2));
