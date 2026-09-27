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
  const businessPerSecond = Math.max(0, businessProfitPerHour / 3600);
  const businessRows: IncomeSource[] = active.map(item => ({
    label: item.name,
    perSecond: rawTotal > 0 ? Number((businessPerSecond * (Math.max(0, item.hourlyNetProfit) / rawTotal)).toFixed(4)) : 0,
    color: item.sector === 'Retail' ? INCOME_SOURCE_COLORS.retail : item.sector === 'Mobility' ? INCOME_SOURCE_COLORS.mobility : INCOME_SOURCE_COLORS.business,
    note: item.hourlyNetProfit > 0 ? `${item.sector} operating cashflow` : `${item.sector} · operating ramp / awaiting demand`,
  }));

  const tapPerSecond = Number(((clickValue * tapRewardMultiplier(tapsToday) * tapBoostMultiplier * 600) / (24 * 60 * 60)).toFixed(4));
  const dividendPerSecond = Number((calculateQuarterlyDividends(assets, holdings) / (90 * 24 * 60 * 60)).toFixed(4));
  return [
    ...businessRows,
    { label: 'Tap actions', perSecond: tapPerSecond, color: INCOME_SOURCE_COLORS.tap, note: 'Tap run-rate with soft diminishing returns' },
    { label: 'Stocks · quarterly dividends', perSecond: dividendPerSecond, color: INCOME_SOURCE_COLORS.stocks, note: dividendPerSecond > 0 ? 'Portfolio dividend run-rate' : 'No held dividend yield yet' },
  ];
}
