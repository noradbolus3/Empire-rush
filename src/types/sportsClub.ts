export type SportsClubTab =
  | "dashboard"
  | "facilities"
  | "teams"
  | "matches"
  | "revenue"
  | "expansion";

export type SportsClubStage =
  | "Local Club"
  | "Professional Club"
  | "Major Sports Club"
  | "Sports Group";

export type SportsClubState = {
  schemaVersion: number;
  id: "sports-club-company";
  clubName: string;
  stage: SportsClubStage;
  cashReserve: number;
  reputation: number;
  fanSatisfaction: number;
  stadiumCapacity: number;
  trainingLevel: number;
  medicalLevel: number;
  teams: number;
  players: number;
  coaches: number;
  payrollPerSettlement: number;
  academyLevel: number;
  nextMatchAt: number;
  matchesPlayed: number;
  wins: number;
  sponsorshipRevenue: number;
  ticketRevenue: number;
  merchandiseRevenue: number;
  cityCount: number;
  activeTournament: string | null;
  lastEvent: string;
};

export const SPORTS_CLUB_SCHEMA_VERSION = 1;

export const DEFAULT_SPORTS_CLUB: SportsClubState = {
  schemaVersion: SPORTS_CLUB_SCHEMA_VERSION,
  id: "sports-club-company",
  clubName: "Northstar Athletic Club",
  stage: "Local Club",
  cashReserve: 0,
  reputation: 48,
  fanSatisfaction: 62,
  stadiumCapacity: 2500,
  trainingLevel: 1,
  medicalLevel: 1,
  teams: 1,
  players: 18,
  coaches: 2,
  payrollPerSettlement: 240,
  academyLevel: 0,
  nextMatchAt: 0,
  matchesPlayed: 0,
  wins: 0,
  sponsorshipRevenue: 0,
  ticketRevenue: 0,
  merchandiseRevenue: 0,
  cityCount: 1,
  activeTournament: null,
  lastEvent: "Club charter ready · recruit your first competitive squad.",
};
