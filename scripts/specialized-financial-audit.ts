import { DEFAULT_SPORTS_CLUB } from "../src/types/sportsClub";
import { matchOutcome, projectedHourlyRevenue, signSponsor, trainTeam, upgradeFacility } from "../src/engine/sportsClubEngine";
import { DEFAULT_OIL_GAS } from "../src/types/oilGas";
import { exploreField, openStation, projectedHourlyProfit as oilProfit, signInternationalContract } from "../src/engine/oilGasEngine";
import { DEFAULT_AIRLINE } from "../src/types/airline";
import { acquireAircraft, openRoute, projectedHourlyProfit as airlineProfit } from "../src/engine/airlineEngine";
import { DEFAULT_HOTEL } from "../src/types/hotel";
import { acquireProperty, projectedHourlyProfit as hotelProfit, renovateRooms } from "../src/engine/hotelEngine";
import { DEFAULT_BLOCKCHAIN } from "../src/types/blockchain";
import { deployInfrastructure, fundResearch, projectedHourlyProfit as blockchainProfit, signClients } from "../src/engine/blockchainEngine";
import { DEFAULT_SPACE } from "../src/types/space";
import { buildRocket, deploySatellites, projectedHourlyProfit as spaceProfit, fundResearch as fundSpaceResearch } from "../src/engine/spaceEngine";
import { DEFAULT_HOLDING } from "../src/types/holding";
import { acquireTarget, consolidatedHourlyProfit, upgradeTreasury } from "../src/engine/holdingEngine";
import { readFileSync } from "node:fs";

const scenarios: Record<string, unknown>[] = [];
const check = (label: string, ok: boolean, raw: Record<string, unknown>) => {
  if (!ok) throw new Error(`${label} failed: ${JSON.stringify(raw)}`);
  scenarios.push({ label, ok, ...raw });
};
const screenText = (name: string) => readFileSync(`src/screens/${name}`, "utf8");
const ledgerHook = (name: string) => /onLedger\?\./.test(screenText(name)) || /commitCashTransaction[\s\S]*ledgerEntry/.test(screenText(name));
const cashGuard = (name: string) => /cash\s*</.test(screenText(name)) || /commitCashTransaction[\s\S]*amount:/.test(screenText(name));

const sportsA = trainTeam(DEFAULT_SPORTS_CLUB);
const sportsB = upgradeFacility(DEFAULT_SPORTS_CLUB, "stadium");
const sportsC = signSponsor(DEFAULT_SPORTS_CLUB);
check("Sports upgrades and revenue", sportsA.trainingLevel > DEFAULT_SPORTS_CLUB.trainingLevel && sportsB.stadiumCapacity > DEFAULT_SPORTS_CLUB.stadiumCapacity && sportsC.sponsorshipRevenue > DEFAULT_SPORTS_CLUB.sponsorshipRevenue && projectedHourlyRevenue(sportsC) >= 0, { trainingLevel: sportsA.trainingLevel, stadiumCapacity: sportsB.stadiumCapacity, sponsorshipRevenue: sportsC.sponsorshipRevenue });
check("Sports deterministic match", matchOutcome(DEFAULT_SPORTS_CLUB, 17).matchesPlayed === DEFAULT_SPORTS_CLUB.matchesPlayed + 1, { matchesBefore: DEFAULT_SPORTS_CLUB.matchesPlayed, matchesAfter: matchOutcome(DEFAULT_SPORTS_CLUB, 17).matchesPlayed });

const oilA = exploreField(DEFAULT_OIL_GAS);
const oilB = openStation(DEFAULT_OIL_GAS);
const oilC = signInternationalContract(DEFAULT_OIL_GAS);
check("Oil and Gas upgrades and revenue", oilA.fields === DEFAULT_OIL_GAS.fields + 1 && oilB.fuelStations === DEFAULT_OIL_GAS.fuelStations + 1 && oilC.internationalContracts === DEFAULT_OIL_GAS.internationalContracts + 1 && oilProfit(oilC) >= 0, { fields: oilA.fields, stations: oilB.fuelStations, contracts: oilC.internationalContracts, projectedHourly: oilProfit(oilC) });

const airlineA = acquireAircraft(DEFAULT_AIRLINE);
const airlineB = openRoute(DEFAULT_AIRLINE);
check("Airline fleet and route upgrades", airlineA.aircraft === DEFAULT_AIRLINE.aircraft + 1 && airlineA.seats > DEFAULT_AIRLINE.seats && airlineB.routes === DEFAULT_AIRLINE.routes + 1 && airlineProfit(airlineB) >= 0, { aircraft: airlineA.aircraft, seats: airlineA.seats, routes: airlineB.routes, projectedHourly: airlineProfit(airlineB) });

const hotelA = acquireProperty(DEFAULT_HOTEL);
const hotelB = renovateRooms(DEFAULT_HOTEL);
check("Hotel property and room upgrades", hotelA.properties === DEFAULT_HOTEL.properties + 1 && hotelA.rooms > DEFAULT_HOTEL.rooms && hotelB.roomRate > DEFAULT_HOTEL.roomRate && hotelProfit(hotelB) >= 0, { properties: hotelA.properties, rooms: hotelA.rooms, roomRate: hotelB.roomRate, projectedHourly: hotelProfit(hotelB) });

const blockchainA = deployInfrastructure(DEFAULT_BLOCKCHAIN);
const blockchainB = fundResearch(DEFAULT_BLOCKCHAIN);
const blockchainC = signClients(DEFAULT_BLOCKCHAIN);
check("Blockchain infrastructure, research and clients", blockchainA.servers === DEFAULT_BLOCKCHAIN.servers + 1 && blockchainB.developers > DEFAULT_BLOCKCHAIN.developers && blockchainC.clients === DEFAULT_BLOCKCHAIN.clients + 4 && blockchainProfit(blockchainC) >= 0, { servers: blockchainA.servers, developers: blockchainB.developers, clients: blockchainC.clients, projectedHourly: blockchainProfit(blockchainC) });

const spaceA = buildRocket(DEFAULT_SPACE);
const spaceB = deploySatellites(DEFAULT_SPACE);
const spaceC = fundSpaceResearch(DEFAULT_SPACE);
check("Space manufacturing, satellites and research", spaceA.assemblyLines === DEFAULT_SPACE.assemblyLines + 1 && spaceB.satellites === DEFAULT_SPACE.satellites + 2 && spaceC.engineers > DEFAULT_SPACE.engineers && spaceProfit(spaceB) >= 0, { assemblyLines: spaceA.assemblyLines, satellites: spaceB.satellites, engineers: spaceC.engineers, projectedHourly: spaceProfit(spaceB) });

const holdingA = acquireTarget(DEFAULT_HOLDING);
const holdingB = upgradeTreasury(DEFAULT_HOLDING);
check("Holding acquisitions and treasury", holdingA.acquisitionsCompleted === DEFAULT_HOLDING.acquisitionsCompleted + 1 && holdingB.hqLevel === DEFAULT_HOLDING.hqLevel + 1 && consolidatedHourlyProfit(holdingB) >= 0, { acquisitions: holdingA.acquisitionsCompleted, hqLevel: holdingB.hqLevel, projectedHourly: consolidatedHourlyProfit(holdingB) });

const screenChecks = [
  ["TaxiCompanyScreen.tsx", "Taxi"], ["ShippingCompanyScreen.tsx", "Shipping"], ["FactoryCompanyScreen.tsx", "Factory"],
  ["ConstructionCompanyScreen.tsx", "Construction"], ["CarDealershipScreen.tsx", "Dealership"], ["SoftwareCompanyScreen.tsx", "Software"],
  ["SportsClubCompanyScreen.tsx", "Sports"], ["OilGasCompanyScreen.tsx", "OilGas"], ["AirlineCompanyScreen.tsx", "Airline"],
  ["HotelCompanyScreen.tsx", "Hotel"], ["BlockchainCompanyScreen.tsx", "Blockchain"], ["SpaceCompanyScreen.tsx", "Space"], ["HoldingCompanyScreen.tsx", "Holding"],
] as const;
for (const [file, label] of screenChecks) {
  check(`${label} UI cash guard and ledger hook`, cashGuard(file) && ledgerHook(file), { file, cashGuard: cashGuard(file), ledgerHook: ledgerHook(file) });
}
const sportsSource = screenText("SportsClubCompanyScreen.tsx");
check("Sports cash settlement uses one commit path", /commitCashTransaction/.test(sportsSource) && /if \(amount > 0\) onCashChange/.test(sportsSource) && !/onCashChange\(\(value\) => value - 15000\)/.test(sportsSource), { creditsAndDebits: true, noExpansionDoubleDebit: true });

console.log(JSON.stringify({ test: "specialized-financial-audit", modules: 12, scenarioCount: scenarios.length, failed: 0, scenarios }, null, 2));
