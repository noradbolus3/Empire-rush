import { calculateQuarterlyDividends } from './marketEngine';
import { BusinessEntity } from '../types/business';
import { IncomeSource } from '../types/income';
import { Asset, Holding } from '../types/marketAsset';
import { tapRewardMultiplier } from './economyPlan';

export const INCOME_SOURCE_COLORS = {
  retail: '#16E98A',
  mobility: '#FFC928',
  business: '#61E8FF',
  tap: '#FFC928',
  stocks: '#61E8FF',
} as const;

type IncomeLedgerInput = {
  businesses: BusinessEntity[];
  assets: Asset[];
  holdings: Record<string, Holding>;
  clickValue: number;
  tapsToday: number;
  businessProfitPerHour: number;
  tapBoostMultiplier?: number;
};

export function buildIncomeSources({ businesses, assets, holdings, clickValue, tapsToday, businessProfitPerHour, tapBoostMultiplier = 1 }: IncomeLedgerInput): IncomeSource[] {
  const active = businesses.filter(item => item.isAcquired);
  const rawTotal = active.reduce((sum, item) => sum + Math.max(0, item.hourlyNetProfit), 0);
  const businessRows: IncomeSource[] = active.map(item => ({
    label: item.name,
    hourlyProjected: rawTotal > 0 ? Number((Math.max(0, businessProfitPerHour) * (Math.max(0, item.hourlyNetProfit) / rawTotal)).toFixed(2)) : 0,
    color: item.sector === 'Retail' ? INCOME_SOURCE_COLORS.retail : item.sector === 'Mobility' ? INCOME_SOURCE_COLORS.mobility : INCOME_SOURCE_COLORS.business,
    note: item.hourlyNetProfit > 0 ? `${item.sector} · credited at the next hourly settlement` : `${item.sector} · operating ramp / awaiting demand`,
  }));
  const tapHourly = Number((clickValue * tapRewardMultiplier(tapsToday) * tapBoostMultiplier * 600).toFixed(2));
  const dividendQuarterly = Number(calculateQuarterlyDividends(assets, holdings).toFixed(2));
  return [
    ...businessRows,
    { label: 'Tap actions', hourlyProjected: tapHourly, color: INCOME_SOURCE_COLORS.tap, note: 'Interactive actions credit immediately; not part of business settlement' },
    { label: 'Stocks · quarterly dividends', hourlyProjected: Number((dividendQuarterly / (90 * 24)).toFixed(2)), color: INCOME_SOURCE_COLORS.stocks, note: dividendQuarterly > 0 ? `Quarterly distribution projected at ${dividendQuarterly.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}` : 'No held dividend yield yet' },
  ];
}
