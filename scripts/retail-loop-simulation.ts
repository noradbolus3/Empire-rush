import { DEFAULT_BUSINESSES, simulateBusinessTick } from '../src/engine/businessSimulation';
import { RetailData } from '../src/types/business';

const retail = DEFAULT_BUSINESSES.find(item => item.sector === 'Retail') as RetailData;
let cash = 5000;
let stock: RetailData = { ...retail, isAcquired: true, stockUnits: 0, onboardingStep: 'ORDER_STOCK' };
const orderCost = 2000;
cash -= orderCost;
stock = { ...stock, stockUnits: 1000, onboardingStep: 'WATCH_FIRST_SALE' };
const before = { cash, stockUnits: stock.stockUnits, onboardingStep: stock.onboardingStep };
let firstSale = false;
let revenue = 0;
let cogs = 0;
for (let tick = 0; tick < 60; tick += 1) {
  const result = simulateBusinessTick([stock], 2);
  const next = result.businesses[0];
  if (next.sector !== 'Retail') throw new Error('Retail type changed unexpectedly');
  if (next.stockUnits < stock.stockUnits) firstSale = true;
  const units = stock.stockUnits - next.stockUnits;
  revenue += units * 3.8;
  cogs += units * 2;
  stock = next;
  cash = Math.max(0, cash + result.cashDelta);
}
console.log(JSON.stringify({ order: { cost: orderCost, units: 1000 }, before, firstSale, after: { cash: Number(cash.toFixed(2)), stockUnits: stock.stockUnits, onboardingStep: stock.onboardingStep }, grossRevenue: Number(revenue.toFixed(2)), inventoryCogs: Number(cogs.toFixed(2)), netCashflow: Number((cash - before.cash).toFixed(2)) }, null, 2));
