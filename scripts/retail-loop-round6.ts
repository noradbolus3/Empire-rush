import { DEFAULT_BUSINESSES, simulateBusinessTick } from '../src/engine/businessSimulation';
import { RetailData } from '../src/types/business';
import { STARTING_CASH } from '../src/engine/economyPlan';

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
const snapshots: Snapshot[] = [];
const checkpoints = new Map([[10 * 60, '10 minutes'], [60 * 60, '1 hour'], [24 * 60 * 60, '1 day']]);

function netWorth() { return cash + business.acquisitionCost + business.stockUnits * (business.unitWholesaleCost ?? 2) + (autoRestock ? 1500 : 0); }
function orderStock(units: number, cost: number) { if (cash < cost || business.stockUnits + units > business.maxStockCapacity) return false; cash -= cost; business = { ...business, stockUnits: business.stockUnits + units, onboardingStep: business.onboardingStep === 'ORDER_STOCK' ? 'WATCH_FIRST_SALE' : business.onboardingStep, unitWholesaleCost: cost / units }; orders += 1; return true; }

cash += 1000;
cash -= retail.acquisitionCost;
orderStock(250, 500);
for (let elapsed = 2; elapsed <= 24 * 60 * 60; elapsed += 2) {
  if (!autoRestock && cash >= 250 && elapsed <= 15 * 60) {
    cash -= 250;
    autoRestock = true;
    business = { ...business, autoRestockEnabled: true };
  }
  const beforeStock = business.stockUnits;
  const result = simulateBusinessTick([business], 2, 2, cash);
  business = result.businesses[0] as RetailData;
  cash = Math.max(0, cash + result.cashDelta);
  const sold = Math.max(0, Math.round((business.lastSaleRevenue ?? 0) / ({ Discount: 4, Standard: 5.5, Luxury: 8 } as const)[business.pricingTier]));
  salesUnits += sold;
  cashflow += result.cashDelta;
  demandEvents += result.events.filter(event => event.includes('demand pulse activated')).length;
  if (business.stockUnits > beforeStock) orders += 1;
  minNetWorth = Math.min(minNetWorth, netWorth());
  const label = checkpoints.get(elapsed);
  if (label) snapshots.push({ checkpoint: label, orders, salesUnits, cashflow: Number(cashflow.toFixed(2)), cash: Number(cash.toFixed(2)), netWorth: Number(netWorth().toFixed(2)), minNetWorth: Number(minNetWorth.toFixed(2)), autoRestock, demandEvents, flag: minNetWorth < STARTING_CASH ? 'FAIL: net worth fell' : 'PASS' });
}
console.log(JSON.stringify({ startingCash: STARTING_CASH, starterTapRunway: '$1,000 founder work credit', initialBusinessPurchase: retail.acquisitionCost, initialOrder: '$500 for 250 units', snapshots }, null, 2));
