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

export function buildIncomeSources({ businesses, assets, holdings, businessProfitPerHour, realizedDividendAmount = 0, taxiCompany, shippingCompany, factoryCompany, constructionCompany, softwareCompany, sportsClub, oilGas, airline, hotel, blockchain, space }: IncomeLedgerInput): IncomeSource[] {
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

  if (shippingCompany?.status === 'operating') {
    const net = shippingEconomics(shippingCompany).net;
    if (net !== 0) businessRows.push({ label: shippingCompany.name || 'Shipping Company', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Logistics · credited at the next hourly settlement' });
  }
  if (factoryCompany?.status === 'operating') {
    const net = factoryEconomics(factoryCompany).net;
    if (net !== 0) businessRows.push({ label: factoryCompany.name || 'Manufacturing Co', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Manufacturing · credited at the next hourly settlement' });
  }
  if (constructionCompany?.status === 'operating') {
    const net = (constructionCompany.activeProjects > 0 ? constructionCompany.contractValue : 0) - (constructionCompany.workers * 55 + constructionCompany.excavators * 90 + constructionCompany.cranes * 120 + constructionCompany.mixers * 45 + (constructionCompany.activeProjects ? 150 : 0));
    if (net !== 0) businessRows.push({ label: constructionCompany.name || 'Construction Co', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Construction · credited at the next hourly settlement' });
  }
  if (softwareCompany?.status === 'operating') {
    const net = softwareSettlementTick(softwareCompany).profit;
    if (net !== 0) businessRows.push({ label: softwareCompany.name || 'Software Co', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Software · credited at the next hourly settlement' });
  }
  if (sportsClub && sportsClub.stage !== 'Local Club') {
    const net = sportsClubHourlyRevenue(sportsClub);
    if (net !== 0) businessRows.push({ label: sportsClub.clubName || 'Sports Club', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Sports · credited at the next hourly settlement' });
  }
  if (oilGas && oilGas.stage !== 'Small Operator') {
    const net = oilGasHourlyProfit(oilGas);
    if (net !== 0) businessRows.push({ label: oilGas.companyName || 'Oil & Gas', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Energy · credited at the next hourly settlement' });
  }
  if (airline && airline.stage !== 'Regional Airline') {
    const net = airlineHourlyProfit(airline);
    if (net !== 0) businessRows.push({ label: airline.companyName || 'Airline', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Airline · credited at the next hourly settlement' });
  }
  if (hotel && hotel.stage !== 'Boutique Hotel') {
    const net = hotelHourlyProfit(hotel);
    if (net !== 0) businessRows.push({ label: hotel.companyName || 'Hotel', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Hospitality · credited at the next hourly settlement' });
  }
  if (blockchain && blockchain.stage !== 'Technology Startup') {
    const net = blockchainHourlyProfit(blockchain);
    if (net !== 0) businessRows.push({ label: blockchain.companyName || 'Blockchain', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Technology · credited at the next hourly settlement' });
  }
  if (space && space.stage !== 'Aerospace Startup') {
    const net = spaceHourlyProfit(space);
    if (net !== 0) businessRows.push({ label: space.companyName || 'Space', hourlyProjected: Number(net.toFixed(2)), color: INCOME_SOURCE_COLORS.business, note: 'Aerospace · credited at the next hourly settlement' });
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
