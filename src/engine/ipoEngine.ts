import { BusinessEntity, ExpansionData, RetailData } from '../types/business';
import { Asset } from '../types/ipoAssets';
import { IPOEligibility, IPOListing } from '../types/ipo';
import { IPO_MAX_NET_WORTH_PROCEEDS_MULTIPLE, IPO_MIN_NET_WORTH, IPO_MIN_VALUATION } from './economyPlan';

export const IPO_PUBLIC_OFFERING_PERCENT = 0.2;
export const IPO_MAX_VALUATION_TO_NET_WORTH_MULTIPLE = 4;
export { IPO_MAX_NET_WORTH_PROCEEDS_MULTIPLE, IPO_MIN_NET_WORTH, IPO_MIN_VALUATION } from './economyPlan';

const sectorMultiples: Record<string, number> = { Tech_SaaS: 2.4, Construction_Mega: 1.8, Mobility: 1.35, Retail: 1.15, Real_Estate: 1.2, Energy: 1.25, Pharma: 2, Media: 1.5, Sports: 1.35, Airline: 1.1 };
const expansionBaseHourly: Record<string, number> = { Real_Estate: 1200, Energy: 2200, Pharma: 5500, Media: 11000, Sports: 30000, Airline: 55000 };
const retailUnits = { Discount: 4, Standard: 2, Luxury: 1 } as const;
const retailPrices = { Discount: 4, Standard: 5.5, Luxury: 8 } as const;

function rawOperatingProfitPerHour(business: BusinessEntity): number {
  if (!business.isAcquired) return 0;
  if (Number.isFinite(business.baseHourlyNetProfit)) return Math.max(0, Number(business.baseHourlyNetProfit));
  if (business.sector === 'Retail') {
    const retail = business as RetailData;
    if (retail.stockUnits <= 0) return 0;
    const modeMultiplier = retail.pricingTier === 'Discount' ? 1.55 : retail.pricingTier === 'Luxury' ? 0.55 : 1;
    const units = retailUnits[retail.pricingTier] * 1800 * modeMultiplier;
    const revenue = units * retailPrices[retail.pricingTier];
    const cogs = units * (retail.unitWholesaleCost ?? 2);
    const fixedCosts = ((retail.monthlyRent ?? 800) + (retail.monthlyPayroll ?? 1200)) / (30 * 24);
    const tax = retail.legalStatus === 'Licensed_Legal' ? revenue * 0.15 : 0;
    return Math.max(0, revenue - cogs - fixedCosts - tax);
  }
  if (business.sector === 'Mobility') return Math.max(0, business.economySedans * 2200 + business.electricEVs * 6000 + business.luxuryLimos * 12000) * (business.surgeActive ? 1.7 : 1) * (business.fleetHealth < 30 ? 0.5 : 1);
  if (business.sector === 'Tech_SaaS') return Math.max(0, Math.min(business.activeSubscribers, business.serverCapacity) * 3.5);
  if (business.sector === 'Construction_Mega') return business.activeTenderName && business.projectPhase > 0 ? 0 : 250000;
  const expansion = business as ExpansionData;
  const profileBase = expansionBaseHourly[business.sector] ?? 0;
  const serviceQuality = Math.max(0.45, Math.min(1.2, (expansion.reputation / 100) * (expansion.customerSatisfaction / 100)));
  return Math.max(0, profileBase * Math.max(1, expansion.branchCount) * (expansion.managerHired ? 1.15 : 1) * (1 + expansion.upgradeLevel * 0.18) * serviceQuality);
}

function operatingAssetBase(business: BusinessEntity): number {
  const inventory = business.sector === 'Retail' ? business.stockUnits * (business.unitWholesaleCost ?? 2) : 0;
  const branches = 'branchCount' in business ? Math.max(0, (business.branchCount ?? 1) - 1) * business.acquisitionCost * 0.25 : 0;
  return Math.max(0, business.acquisitionCost + inventory + branches);
}

/**
 * Structural valuation formula:
 * min(operating assets + annualized raw operating profit × sector multiple,
 *     player net worth × 4).
 * Runtime passive multipliers, founder dilution, and synergy are deliberately excluded.
 */
export function businessValuation(business: BusinessEntity, playerNetWorth: number): number {
  const safeNetWorth = Math.max(0, Number.isFinite(playerNetWorth) ? playerNetWorth : 0);
  const rawProfit = rawOperatingProfitPerHour(business);
  const annualizedProfit = rawProfit * 24 * 365;
  const rawValuation = operatingAssetBase(business) + annualizedProfit * (sectorMultiples[business.sector] ?? 1.1);
  const cappedValuation = Math.min(rawValuation, safeNetWorth * IPO_MAX_VALUATION_TO_NET_WORTH_MULTIPLE);
  return Math.max(0, Math.round(cappedValuation / 1000) * 1000);
}

export function getIPOEligibility(business: BusinessEntity, existingListing: IPOListing | null | undefined, playerNetWorth: number): IPOEligibility {
  const valuation = businessValuation(business, playerNetWorth);
  if (!business.isAcquired) return { eligible: false, valuation, reason: 'Acquire and operate this company before taking it public.' };
  if (existingListing?.companyId === business.id && existingListing.stage === 'public') return { eligible: false, valuation, reason: 'This company is already listed on the public exchange.' };
  if (playerNetWorth < IPO_MIN_NET_WORTH) return { eligible: false, valuation, reason: `Reach ${formatMoney(IPO_MIN_NET_WORTH)} net worth to unlock the IPO window.` };
  if (valuation < IPO_MIN_VALUATION) return { eligible: false, valuation, reason: `Reach ${formatMoney(IPO_MIN_VALUATION)} valuation to unlock an IPO.` };
  return { eligible: true, valuation, reason: 'IPO window open. Sell a minority stake and raise growth capital.' };
}

export function normalizeTicker(name: string): string {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, '');
  return (letters.slice(0, 3) || 'EMR').padEnd(3, 'X');
}

export function createIPOListing(business: BusinessEntity, gameTimestamp: number, tickerOverride: string | undefined, playerNetWorth: number): IPOListing {
  const valuation = businessValuation(business, playerNetWorth);
  const publicShares = Math.max(1000, Math.floor(valuation / 10));
  const founderShares = publicShares * 4;
  const sharesOutstanding = founderShares + publicShares;
  const ipoPrice = Number((valuation / sharesOutstanding).toFixed(2));
  const ticker = normalizeTicker(tickerOverride || business.name);
  const grossProceeds = Number((publicShares * ipoPrice).toFixed(2));
  const proceedsCap = Math.max(0, Number(playerNetWorth)) * IPO_MAX_NET_WORTH_PROCEEDS_MULTIPLE;
  return { companyId: business.id, companyName: business.name, ticker, sector: business.sector, sharesOutstanding, founderShares, publicShares, ipoPrice, currentPrice: ipoPrice, capitalRaised: Number(Math.min(grossProceeds, proceedsCap).toFixed(2)), founderOwnershipFraction: 1 - IPO_PUBLIC_OFFERING_PERCENT, valuationAtIPO: valuation, stage: 'public', listedAtGameTimestamp: gameTimestamp, history: [ipoPrice * .96, ipoPrice * .98, ipoPrice, ipoPrice * 1.01, ipoPrice * 1.015] };
}

export function founderOwnershipFraction(listing?: IPOListing | null): number {
  if (!listing) return 1;
  if (Number.isFinite(listing.founderOwnershipFraction)) return Math.min(1, Math.max(0, Number(listing.founderOwnershipFraction)));
  const inferred = listing.sharesOutstanding > 0 ? listing.founderShares / listing.sharesOutstanding : 1 - IPO_PUBLIC_OFFERING_PERCENT;
  return Math.min(1, Math.max(0, inferred));
}

export function capIPOProceeds(listing: IPOListing, netWorth: number): IPOListing {
  const safeNetWorth = Number.isFinite(netWorth) ? Math.max(0, netWorth) : 0;
  const valuationAtIPO = Math.min(Math.max(0, listing.valuationAtIPO), safeNetWorth * IPO_MAX_VALUATION_TO_NET_WORTH_MULTIPLE);
  const safeShares = Math.max(1, listing.sharesOutstanding);
  const ipoPrice = Number((valuationAtIPO / safeShares).toFixed(2));
  const priceRatio = listing.currentPrice > 0 ? ipoPrice / listing.currentPrice : 1;
  const history = listing.history.map(value => Number((Math.max(0, value) * priceRatio).toFixed(2)));
  return { ...listing, valuationAtIPO, ipoPrice, currentPrice: ipoPrice, history: history.length ? history : [ipoPrice], capitalRaised: Number(Math.min(Math.max(0, listing.capitalRaised), safeNetWorth * IPO_MAX_NET_WORTH_PROCEEDS_MULTIPLE).toFixed(2)), founderOwnershipFraction: founderOwnershipFraction(listing) };
}

export function listingToAsset(listing: IPOListing): Asset {
  return { id: `ipo-${listing.companyId}`, symbol: listing.ticker, name: `${listing.companyName} · Class A`, kind: 'STOCK', price: listing.currentPrice, change: 0, dividend: 0, volatility: .018, history: listing.history.length ? listing.history : [listing.currentPrice], maxShares: listing.publicShares, isPlayerCompany: true };
}

function formatMoney(value: number): string { return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`; }
