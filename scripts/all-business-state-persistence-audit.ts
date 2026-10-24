import assert from "node:assert/strict";
import { DEFAULT_TAXI_COMPANY } from "../src/types/taxi";
import { DEFAULT_SHIPPING_COMPANY } from "../src/types/shipping";
import { DEFAULT_FACTORY_COMPANY } from "../src/types/factory";
import { DEFAULT_CONSTRUCTION_COMPANY } from "../src/types/construction";
import { DEFAULT_DEALERSHIP } from "../src/types/dealership";
import { DEFAULT_SOFTWARE_COMPANY } from "../src/types/software";
import { DEFAULT_SPORTS_CLUB } from "../src/types/sportsClub";
import { DEFAULT_OIL_GAS } from "../src/types/oilGas";
import { DEFAULT_AIRLINE } from "../src/types/airline";
import { DEFAULT_HOTEL } from "../src/types/hotel";
import { DEFAULT_BLOCKCHAIN } from "../src/types/blockchain";
import { DEFAULT_SPACE } from "../src/types/space";
import { DEFAULT_HOLDING } from "../src/types/holding";
import { sanitizeSportsClub } from "../src/engine/sportsClubEngine";
import { sanitizeOilGas } from "../src/engine/oilGasEngine";
import { sanitizeAirline } from "../src/engine/airlineEngine";
import { sanitizeHotel } from "../src/engine/hotelEngine";
import { sanitizeBlockchain } from "../src/engine/blockchainEngine";
import { sanitizeSpace } from "../src/engine/spaceEngine";
import { sanitizeHolding } from "../src/engine/holdingEngine";

type Case = { name: string; state: any; field: string; value: unknown; sanitize?: (input: unknown) => any };
const cases: Case[] = [
  { name: "Taxi", state: DEFAULT_TAXI_COMPANY, field: "completedRides", value: 417 },
  { name: "Shipping", state: DEFAULT_SHIPPING_COMPANY, field: "totalIncome", value: 98765 },
  { name: "Factory", state: DEFAULT_FACTORY_COMPANY, field: "totalSales", value: 2400 },
  { name: "Construction", state: DEFAULT_CONSTRUCTION_COMPANY, field: "completedProjects", value: 7 },
  { name: "Car Dealership", state: DEFAULT_DEALERSHIP, field: "totalSales", value: 19 },
  { name: "IT & Software", state: DEFAULT_SOFTWARE_COMPANY, field: "saasProducts", value: 4 },
  { name: "Sports Club", state: DEFAULT_SPORTS_CLUB, field: "wins", value: 12, sanitize: sanitizeSportsClub },
  { name: "Oil & Gas", state: DEFAULT_OIL_GAS, field: "fields", value: 3, sanitize: sanitizeOilGas },
  { name: "Airline", state: DEFAULT_AIRLINE, field: "aircraft", value: 5, sanitize: sanitizeAirline },
  { name: "Hotel", state: DEFAULT_HOTEL, field: "properties", value: 3, sanitize: sanitizeHotel },
  { name: "Blockchain", state: DEFAULT_BLOCKCHAIN, field: "clients", value: 12, sanitize: sanitizeBlockchain },
  { name: "Space", state: DEFAULT_SPACE, field: "satellites", value: 2, sanitize: sanitizeSpace },
  { name: "Holding Company", state: DEFAULT_HOLDING, field: "acquisitionsCompleted", value: 2, sanitize: sanitizeHolding },
];
const results: Record<string, unknown>[] = [];
for (const item of cases) {
  const saved = { ...item.state, [item.field]: item.value };
  const encoded = JSON.stringify(saved);
  const parsed = JSON.parse(encoded);
  const loaded = item.sanitize ? item.sanitize(parsed) : parsed;
  assert.equal(loaded[item.field], item.value, `${item.name}: sentinel field was not preserved`);
  assert.equal(loaded.id, item.state.id, `${item.name}: id was not preserved`);
  assert.equal(typeof encoded, "string");
  if (item.sanitize) {
    const fallback = item.sanitize(null);
    const corrupted = item.sanitize({ id: item.state.id, [item.field]: "not-a-number" });
    assert.equal(fallback.id, item.state.id, `${item.name}: null fallback id mismatch`);
    assert.notEqual(corrupted[item.field], "not-a-number", `${item.name}: corrupt value was not sanitized`);
  }
  results.push({ name: item.name, field: item.field, preserved: loaded[item.field], bytes: encoded.length, sanitizer: Boolean(item.sanitize) });
}
console.log(JSON.stringify({ test: "all-business-state-persistence-audit", modules: cases.length, checks: results.length * 2 + 7 * 2, failed: 0, results }, null, 2));
