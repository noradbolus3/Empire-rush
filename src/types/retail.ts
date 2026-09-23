export interface RetailShopState {
  owned: boolean;
  inventoryUnits: number;
  staffHired: boolean;
  lastAccountingAt: number;
}

export const RETAIL_SETUP_COST = 500;
export const RETAIL_RENT_UTILITIES_MONTHLY = 800;
export const RETAIL_BATCH_COST = 500;
export const RETAIL_BATCH_UNITS = 100;
export const RETAIL_SELLING_PRICE = 12;
export const RETAIL_PAYROLL_MONTHLY = 1200;
export const RETAIL_SALES_PER_HOUR = 10;
export const RETAIL_HOURS_PER_MONTH = 30 * 24;

export function retailHourlyAccounting(state: RetailShopState) {
  const salesUnits = state.owned && state.staffHired ? Math.min(state.inventoryUnits, RETAIL_SALES_PER_HOUR) : 0;
  const revenue = salesUnits * RETAIL_SELLING_PRICE;
  const cogs = salesUnits * (RETAIL_BATCH_COST / RETAIL_BATCH_UNITS);
  const rent = state.owned ? RETAIL_RENT_UTILITIES_MONTHLY / RETAIL_HOURS_PER_MONTH : 0;
  const payroll = state.owned && state.staffHired ? RETAIL_PAYROLL_MONTHLY / RETAIL_HOURS_PER_MONTH : 0;
  return { salesUnits, revenue, cogs, rent, payroll, netProfit: revenue - cogs - rent - payroll };
}
