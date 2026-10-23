import { BusinessEntity } from "../types/business";
import { DEFAULT_HOLDING, HoldingState, HoldingSubsidiary } from "../types/holding";

export const HOLDING_SAVE = "empire-rush-holding-v1";

export function sanitizeHolding(x: unknown): HoldingState {
  if (!x || typeof x !== "object") return { ...DEFAULT_HOLDING };
  const r = x as Partial<HoldingState>;
  return {
    ...DEFAULT_HOLDING,
    ...r,
    schemaVersion: 1,
    subsidiaries: Array.isArray(r.subsidiaries) ? r.subsidiaries : [],
    cashReserve: Math.max(0, Number(r.cashReserve) || 0),
    groupDebt: Math.max(0, Number(r.groupDebt) || 0),
    hqLevel: Math.max(0, Number(r.hqLevel) || 0),
    acquisitionsCompleted: Math.max(0, Number(r.acquisitionsCompleted) || 0),
    sharedServicesLevel: Math.max(0, Number(r.sharedServicesLevel) || 0),
    synergyRate: Math.max(0, Number(r.synergyRate) || 0),
    ceoCount: Math.max(0, Number(r.ceoCount) || 0),
    boardLevel: Math.max(0, Number(r.boardLevel) || 0),
    internationalMarkets: Math.max(0, Number(r.internationalMarkets) || 0),
    restructurings: Math.max(0, Number(r.restructurings) || 0),
  };
}

export function syncSubsidiaries(state: HoldingState, businesses: BusinessEntity[]): HoldingState {
  const subsidiaries = businesses.filter((business) => business.isAcquired).map(
    (business): HoldingSubsidiary => ({
      id: business.id,
      name: business.name,
      sector: business.sector,
      ownership: 100,
      revenuePerHour: Math.max(0, Number(business.hourlyNetProfit) || 0),
      expensesPerHour: 0,
      ceo: "Founder",
      managed: true,
      acquiredAt: Date.now(),
    }),
  );
  const revenue = subsidiaries.reduce((total, item) => total + item.revenuePerHour, 0);
  const expenses = subsidiaries.reduce((total, item) => total + item.expensesPerHour, 0);
  const stage = subsidiaries.length >= 8 ? "Global Empire" : subsidiaries.length >= 5 ? "Conglomerate" : subsidiaries.length >= 3 ? "Holding Company" : subsidiaries.length >= 2 ? "Multi-Business Owner" : "Business Owner";
  return { ...state, subsidiaries, consolidatedRevenue: Math.round(revenue), consolidatedExpenses: Math.round(expenses), stage };
}

export const acquireTarget = (state: HoldingState): HoldingState => ({ ...state, acquisitionTargets: state.acquisitionTargets + 1, acquisitionsCompleted: state.acquisitionsCompleted + 1, lastEvent: "Target acquired · ownership and consolidated reporting are now active." });
export const upgradeTreasury = (state: HoldingState): HoldingState => ({ ...state, hqLevel: state.hqLevel + 1, sharedServicesLevel: state.sharedServicesLevel + 1, synergyRate: Math.min(0.2, state.synergyRate + 0.04), lastEvent: "Group treasury upgraded · shared services reduce duplicated operating costs." });
export const appointExecutives = (state: HoldingState): HoldingState => ({ ...state, ceoCount: state.ceoCount + 1, boardLevel: state.boardLevel + 1, lastEvent: "Executive governance upgraded · subsidiaries now have accountable leadership." });
export const activateSynergy = (state: HoldingState): HoldingState => ({ ...state, sharedServicesLevel: state.sharedServicesLevel + 1, synergyRate: Math.min(0.25, state.synergyRate + 0.05), lastEvent: "Shared services activated · procurement, HR and accounting now cooperate across subsidiaries." });
export const expandStrategy = (state: HoldingState): HoldingState => ({ ...state, internationalMarkets: state.internationalMarkets + 1, restructurings: state.restructurings + 1, lastEvent: "Corporate strategy expanded · international market and restructuring options unlocked." });
export function consolidatedHourlyProfit(state: HoldingState): number { return Math.max(0, Math.round((state.consolidatedRevenue - state.consolidatedExpenses) * (1 + state.synergyRate))); }
