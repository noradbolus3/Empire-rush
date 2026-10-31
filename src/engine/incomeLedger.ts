import { calculateQuarterlyDividends } from './marketEngine';
import { BusinessEntity } from '../types/business';
import { IncomeSource } from '../types/income';
import { Asset, Holding } from '../types/marketAsset';
import type { TaxiCompanyState } from '../types/taxi';
import { taxiHourlyEconomics } from '../types/taxi';
import type { ShippingCompanyState } from '../types/shipping';
import { shippingEconomics } from '../types/shipping';
import type { FactoryCompanyState } from '../types/factory';
import { factoryEconomics } from '../types/factory';
import type { ConstructionCompanyState } from '../types/construction';

import type { SoftwareCompanyState } from '../types/software';
import { softwareSettlementTick } from '../types/software';
import type { SportsClubState } from '../types/sportsClub';
import { projectedHourlyRevenue as sportsClubHourlyRevenue } from '../engine/sportsClubEngine';
import type { AirlineState } from '../types/airline';
import { projectedHourlyProfit as airlineHourlyProfit } from '../engine/airlineEngine';
import type { HotelState } from '../types/hotel';
import { projectedHourlyProfit as hotelHourlyProfit } from '../engine/hotelEngine';
import type { BlockchainState } from '../types/blockchain';
import { projectedHourlyProfit as blockchainHourlyProfit } from '../engine/blockchainEngine';
import type { SpaceState } from '../types/space';
import { projectedHourlyProfit as spaceHourlyProfit } from '../engine/spaceEngine';
import type { OilGasState } from '../types/oilGas';
import { projectedHourlyProfit as oilGasHourlyProfit } from '../engine/oilGasEngine';


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
  taxiCompany?: TaxiCompanyState | null;
  shippingCompany?: ShippingCompanyState | null;
  factoryCompany?: FactoryCompanyState | null;
  constructionCompany?: ConstructionCompanyState | null;
  softwareCompany?: SoftwareCompanyState | null;
  sportsClub?: SportsClubState | null;
  oilGas?: OilGasState | null;
  airline?: AirlineState | null;
  hotel?: HotelState | null;
  blockchain?: BlockchainState | null;
  space?: SpaceState | null;

};

export function buildIncomeSources({ businesses, assets, holdings, businessProfitPerHour, realizedDividendAmount = 0, taxiCompany }: IncomeLedgerInput): IncomeSource[] {
  const active = businesses.filter(item => item.isAcquired);
  const rawTotal = active.reduce((sum, item) => sum + Math.max(0, item.hourlyNetProfit), 0);
  const businessRows: IncomeSource[] = active.map(item => ({
    label: item.name,
    hourlyProjected: rawTotal > 0 ? Number((Math.max(0, businessProfitPerHour) * (Math.max(0, item.hourlyNetProfit) / rawTotal)).toFixed(2)) : 0,
    color: item.sector === 'Retail' ? INCOME_SOURCE_COLORS.retail : item.sector === 'Mobility' ? INCOME_SOURCE_COLORS.mobility : INCOME_SOURCE_COLORS.business,
    note: item.hourlyNetProfit > 0 ? `${item.sector} · credited at the next hourly settlement` : `${item.sector} · operating ramp / awaiting demand`,
  }));
  if (taxiCompany?.status === 'operating') {
    const taxiNet = Math.max(0, taxiHourlyEconomics(taxiCompany).net);
    businessRows.push({
      label: taxiCompany.name || 'Taxi Company',
      hourlyProjected: Number(taxiNet.toFixed(2)),
      color: INCOME_SOURCE_COLORS.mobility,
      note: 'Mobility · credited at the next hourly settlement',
    });
  }

  if (arguments[0].shippingCompany?.status === 'operating') {
    const net = Math.max(0, shippingEconomics(arguments[0].shippingCompany).net);
    if (net > 0) businessRows.push({ label: arguments[0].shippingCompany.name || 'Shipping Company', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Logistics · credited at the next hourly settlement' });
  }
  if (arguments[0].factoryCompany?.status === 'operating') {
    const net = Math.max(0, factoryEconomics(arguments[0].factoryCompany).net);
    if (net > 0) businessRows.push({ label: arguments[0].factoryCompany.name || 'Manufacturing Co', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Manufacturing · credited at the next hourly settlement' });
  }
  if (arguments[0].constructionCompany?.status === 'operating') {
    const net = Math.max(0, (arguments[0].constructionCompany.activeProjects > 0 ? arguments[0].constructionCompany.contractValue : 0) - (arguments[0].constructionCompany.workers * 55 + arguments[0].constructionCompany.excavators * 90 + arguments[0].constructionCompany.cranes * 120 + arguments[0].constructionCompany.mixers * 45 + (arguments[0].constructionCompany.activeProjects ? 150 : 0)));
    if (net > 0) businessRows.push({ label: arguments[0].constructionCompany.name || 'Construction Co', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Construction · credited at the next hourly settlement' });
  }
  if (arguments[0].softwareCompany?.status === 'operating') {
    const net = Math.max(0, softwareSettlementTick(arguments[0].softwareCompany).profit);
    if (net > 0) businessRows.push({ label: arguments[0].softwareCompany.name || 'Software Co', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Software · credited at the next hourly settlement' });
  }
  if (arguments[0].sportsClub && arguments[0].sportsClub.stage !== 'Local Club') {
    const net = Math.max(0, sportsClubHourlyRevenue(arguments[0].sportsClub));
    if (net > 0) businessRows.push({ label: arguments[0].sportsClub.companyName || 'Sports Club', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Sports · credited at the next hourly settlement' });
  }
  if (arguments[0].oilGas && arguments[0].oilGas.stage !== 'Small Operator') {
    const net = Math.max(0, oilGasHourlyProfit(arguments[0].oilGas));
    if (net > 0) businessRows.push({ label: arguments[0].oilGas.companyName || 'Oil & Gas', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Energy · credited at the next hourly settlement' });
  }
  if (arguments[0].airline && arguments[0].airline.stage !== 'Regional Airline') {
    const net = Math.max(0, airlineHourlyProfit(arguments[0].airline));
    if (net > 0) businessRows.push({ label: arguments[0].airline.companyName || 'Airline', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Airline · credited at the next hourly settlement' });
  }
  if (arguments[0].hotel && arguments[0].hotel.stage !== 'Boutique Hotel') {
    const net = Math.max(0, hotelHourlyProfit(arguments[0].hotel));
    if (net > 0) businessRows.push({ label: arguments[0].hotel.companyName || 'Hotel', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Hospitality · credited at the next hourly settlement' });
  }
  if (arguments[0].blockchain && arguments[0].blockchain.stage !== 'Technology Startup') {
    const net = Math.max(0, blockchainHourlyProfit(arguments[0].blockchain));
    if (net > 0) businessRows.push({ label: arguments[0].blockchain.companyName || 'Blockchain', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Technology · credited at the next hourly settlement' });
  }
  if (arguments[0].space && arguments[0].space.stage !== 'Aerospace Startup') {
    const net = Math.max(0, spaceHourlyProfit(arguments[0].space));
    if (net > 0) businessRows.push({ label: arguments[0].space.companyName || 'Space', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Aerospace · credited at the next hourly settlement' });
  }

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
