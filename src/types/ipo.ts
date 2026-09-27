export type IPOStage = 'private' | 'public';

export interface IPOListing {
  companyId: string;
  companyName: string;
  ticker: string;
  sector: string;
  sharesOutstanding: number;
  founderShares: number;
  publicShares: number;
  ipoPrice: number;
  currentPrice: number;
  capitalRaised: number;
  founderOwnershipFraction?: number;
  valuationAtIPO: number;
  stage: IPOStage;
  listedAtTimestamp: number;
  history: number[];
}

export interface IPOEligibility {
  eligible: boolean;
  valuation: number;
  reason: string;
}
