import { businessValuation, IPO_MAX_VALUATION_TO_NET_WORTH_MULTIPLE } from '../src/engine/ipoEngine';
import { DEFAULT_BUSINESSES } from '../src/engine/businessSimulation';
import { RetailData } from '../src/types/business';

type Case = { playerNetWorth: number; valuation: number; maxAllowed: number; valuationToNetWorth: number };
const company = { ...DEFAULT_BUSINESSES.find(item => item.sector === 'Retail')!, isAcquired: true, stockUnits: 2500, baseHourlyNetProfit: 25000, hourlyNetProfit: 25000 } as RetailData;
const cases: Case[] = [10_000_000, 50_000_000].map(playerNetWorth => {
  const valuation = businessValuation(company, playerNetWorth);
  return { playerNetWorth, valuation, maxAllowed: playerNetWorth * IPO_MAX_VALUATION_TO_NET_WORTH_MULTIPLE, valuationToNetWorth: Number((valuation / playerNetWorth).toFixed(2)) };
});
if (cases[0].valuation > cases[0].maxAllowed || cases[1].valuation > cases[1].maxAllowed) throw new Error('Valuation exceeded structural 4x net-worth cap');
if (cases[1].valuation <= cases[0].valuation) throw new Error('Valuation order inverted: larger net worth did not produce larger valuation');
console.log(JSON.stringify({ formula: 'min(operatingAssets + rawAnnualizedOperatingProfit × sectorMultiple, playerNetWorth × 4)', rawOperatingProfitPerHour: company.baseHourlyNetProfit, sectorMultiple: 1.15, cases, result: 'PASS' }, null, 2));
