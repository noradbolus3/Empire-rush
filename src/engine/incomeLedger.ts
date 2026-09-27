import { calculateQuarterlyDividends } from './marketEngine';
import { BusinessEntity } from '../types/business';
import { IncomeSource } from '../types/income';
import { Asset, Holding } from '../types/marketAsset';

export const INCOME_SOURCE_COLORS = {
  retail: '#16E98A',
  mobility: '#FFC928',
  business: '#61E8FF',
  stocks: '#61E8FF',
} as const;

type IncomeLedgerInput = {
  businesses: BusinessEntity[];
  assets: Asset[];
  holdings: Record<string, Holding>;
  businessProfitPerHour: number;
  realizedDividendAmount?: number;
};

export function buildIncomeSources({ businesses, assets, holdings, businessProfitPerHour, realizedDividendAmount = 0 }: IncomeLedgerInput): IncomeSource[] {
  const active = businesses.filter(item => item.isAcquired);
  const rawTotal = active.reduce((sum, item) => sum + Math.max(0, item.hourlyNetProfit), 0);
  const businessRows: IncomeSource[] = active.map(item => ({
    label: item.name,
    hourlyProjected: rawTotal > 0 ? Number((Math.max(0, businessProfitPerHour) * (Math.max(0, item.hourlyNetProfit) / rawTotal)).toFixed(2)) : 0,
    color: item.sector === 'Retail' ? INCOME_SOURCE_COLORS.retail : item.sector === 'Mobility' ? INCOME_SOURCE_COLORS.mobility : INCOME_SOURCE_COLORS.business,
    note: item.hourlyNetProfit > 0 ? `${item.sector} · credited at the next hourly settlement` : `${item.sector} · operating ramp / awaiting demand`,
  }));
  const dividendQuarterlyPotential = Number(calculateQuarterlyDividends(assets, holdings).toFixed(2));
  const realizedDividend = Math.max(0, Number(realizedDividendAmount) || 0);
  const stockNote = realizedDividend > 0
    ? `Actual dividend settlement recorded: ${realizedDividend.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`
    : dividendQuarterlyPotential > 0
      ? 'Yield exists, but no quarterly dividend event has settled yet'
      : 'No held dividend yield yet';
  return [
    ...businessRows,
    { label: 'Stocks · realized dividends', hourlyProjected: realizedDividend, color: INCOME_SOURCE_COLORS.stocks, cadence: 'event', note: stockNote },
  ];
}
