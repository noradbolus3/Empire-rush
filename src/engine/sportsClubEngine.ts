import { DEFAULT_SPORTS_CLUB, SportsClubState } from "../types/sportsClub";

export const SPORTS_CLUB_SAVE = "empire-rush-sports-club-v1";
export const SPORTS_SETTLEMENT_SECONDS = 3600;

export function sanitizeSportsClub(input: unknown): SportsClubState {
  if (!input || typeof input !== "object") return { ...DEFAULT_SPORTS_CLUB };
  const raw = input as Partial<SportsClubState>;
  return {
    ...DEFAULT_SPORTS_CLUB,
    ...raw,
    schemaVersion: 1,
    cashReserve: Math.max(0, Number(raw.cashReserve) || 0),
    reputation: Math.max(0, Math.min(100, Number(raw.reputation) || 0)),
    fanSatisfaction: Math.max(0, Math.min(100, Number(raw.fanSatisfaction) || 0)),
    stadiumCapacity: Math.max(2500, Math.floor(Number(raw.stadiumCapacity) || 2500)),
    trainingLevel: Math.max(1, Math.floor(Number(raw.trainingLevel) || 1)),
    medicalLevel: Math.max(1, Math.floor(Number(raw.medicalLevel) || 1)),
    teams: Math.max(1, Math.floor(Number(raw.teams) || 1)),
    players: Math.max(18, Math.floor(Number(raw.players) || 18)),
    coaches: Math.max(2, Math.floor(Number(raw.coaches) || 2)),
    cityCount: Math.max(1, Math.floor(Number(raw.cityCount) || 1)),
  };
}

export function matchOutcome(state: SportsClubState, seed: number): SportsClubState {
  const form = state.trainingLevel * 0.04 + state.reputation / 1000;
  const won = ((seed * 9301 + 49297) % 233280) / 233280 < 0.42 + form;
  const ticket = Math.round(state.stadiumCapacity * (won ? 0.08 : 0.045));
  const merch = Math.round(ticket * (1.8 + state.fanSatisfaction / 100));
  const next = {
    ...state,
    matchesPlayed: state.matchesPlayed + 1,
    wins: state.wins + (won ? 1 : 0),
    ticketRevenue: state.ticketRevenue + ticket,
    merchandiseRevenue: state.merchandiseRevenue + merch,
    reputation: Math.max(0, Math.min(100, state.reputation + (won ? 2 : -1))),
    fanSatisfaction: Math.max(0, Math.min(100, state.fanSatisfaction + (won ? 2 : -2))),
    lastEvent: won ? `Match win · ${ticket.toLocaleString()} tickets sold.` : `Match loss · fans expect a stronger response.`,
  };
  return refreshStage(next);
}

export function trainTeam(state: SportsClubState): SportsClubState {
  return {
    ...state,
    trainingLevel: state.trainingLevel + 1,
    players: state.players + 2,
    payrollPerSettlement: state.payrollPerSettlement + 35,
    reputation: Math.min(100, state.reputation + 1),
    lastEvent: `Training block complete · squad depth now ${state.players + 2}.`,
  };
}

export function upgradeFacility(state: SportsClubState, facility: "stadium" | "medical"): SportsClubState {
  if (facility === "stadium") {
    return { ...state, stadiumCapacity: state.stadiumCapacity + 1500, ticketRevenue: state.ticketRevenue, lastEvent: "Stadium expansion complete · new seating released." };
  }
  return { ...state, medicalLevel: state.medicalLevel + 1, fanSatisfaction: Math.min(100, state.fanSatisfaction + 3), lastEvent: "Medical centre upgraded · injury recovery is more reliable." };
}

export function signSponsor(state: SportsClubState): SportsClubState {
  const deal = 1200 + state.reputation * 35;
  return { ...state, sponsorshipRevenue: state.sponsorshipRevenue + deal, reputation: Math.min(100, state.reputation + 2), lastEvent: `Sponsor signed · ${deal.toLocaleString()} added to contracted revenue.` };
}

export function expandClub(state: SportsClubState): SportsClubState {
  const cities = state.cityCount + 1;
  const stage = cities >= 4 ? "Sports Group" : cities >= 3 ? "Major Sports Club" : cities >= 2 ? "Professional Club" : state.stage;
  return { ...state, cityCount: cities, teams: state.teams + 1, academyLevel: Math.max(1, state.academyLevel + 1), stage, lastEvent: `Expansion signed · ${cities} city footprint and ${state.teams + 1} teams.` };
}

export function projectedHourlyRevenue(state: SportsClubState): number {
  return Math.max(0, Math.round((state.ticketRevenue + state.merchandiseRevenue + state.sponsorshipRevenue) / 24 + state.stadiumCapacity * 0.12 + state.reputation * 8 - state.payrollPerSettlement));
}

function refreshStage(state: SportsClubState): SportsClubState {
  const stage = state.cityCount >= 4 ? "Sports Group" : state.cityCount >= 3 ? "Major Sports Club" : state.cityCount >= 2 ? "Professional Club" : state.stage;
  return { ...state, stage };
}
