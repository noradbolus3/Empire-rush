import { BusinessEntity } from '../types/business';
import { Asset } from '../types/ipoAssets';
import { IPOEligibility, IPOListing } from '../types/ipo';

export const IPO_MIN_VALUATION = 500000;
export const IPO_PUBLIC_OFFERING_PERCENT = 0.2;

export function businessValuation(business: BusinessEntity): number {
  const annualizedProfit = Math.max(0, business.hourlyNetProfit) * 24 * 365;
  const operatingBase = business.acquisitionCost + (business.isAcquired ? business.acquisitionCost * 0.5 : 0);
  const sectorMultiple = business.sector === 'Tech_SaaS' ? 2.4 : business.sector === 'Construction_Mega' ? 1.8 : business.sector === 'Mobility' ? 1.35 : 1.15;
  return Math.max(0, Math.round((operatingBase + annualizedProfit * sectorMultiple) / 1000) * 1000);
}

export function getIPOEligibility(business: BusinessEntity, existingListing?: IPOListing | null): IPOEligibility {
  const valuation = businessValuation(business);
  if (!business.isAcquired) return { eligible: false, valuation, reason: 'Acquire and operate this company before taking it public.' };
  if (existingListing?.companyId === business.id && existingListing.stage === 'public') return { eligible: false, valuation, reason: 'This company is already listed on the public exchange.' };
  if (valuation < IPO_MIN_VALUATION) return { eligible: false, valuation, reason: `Reach ${formatMoney(IPO_MIN_VALUATION)} valuation to unlock an IPO.` };
  return { eligible: true, valuation, reason: 'IPO window open. Sell a minority stake and raise growth capital.' };
}

export function normalizeTicker(name: string): string {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, '');
  return (letters.slice(0, 3) || 'EMR').padEnd(3, 'X');
}

export function createIPOListing(business: BusinessEntity, gameTimestamp: number, tickerOverride?: string): IPOListing {
  const valuation = businessValuation(business);
  const publicShares = Math.max(1000, Math.floor(valuation / 10));
  const founderShares = publicShares * 4;
  const sharesOutstanding = founderShares + publicShares;
  const ipoPrice = Number((valuation / sharesOutstanding).toFixed(2));
  const ticker = normalizeTicker(tickerOverride || business.name);
  return { companyId: business.id, companyName: business.name, ticker, sector: business.sector, sharesOutstanding, founderShares, publicShares, ipoPrice, currentPrice: ipoPrice, capitalRaised: Number((publicShares * ipoPrice).toFixed(2)), valuationAtIPO: valuation, stage: 'public', listedAtGameTimestamp: gameTimestamp, history: [ipoPrice * .96, ipoPrice * .98, ipoPrice, ipoPrice * 1.01, ipoPrice * 1.015] };
}

export function listingToAsset(listing: IPOListing): Asset {
  return { id: `ipo-${listing.companyId}`, symbol: listing.ticker, name: `${listing.companyName} · Class A`, kind: 'STOCK', price: listing.currentPrice, change: 0, dividend: 0, volatility: .018, history: listing.history.length ? listing.history : [listing.currentPrice], maxShares: listing.publicShares, isPlayerCompany: true };
}

function formatMoney(value: number): string { return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`; }
