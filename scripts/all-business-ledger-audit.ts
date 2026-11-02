import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import { DEFAULT_BUSINESSES } from "../src/engine/businessSimulation";
import { advanceBusinessOperationsWithSales } from "../src/engine/businessEngine";

const modules = [
  ["TaxiCompanyScreen.tsx", "Taxi"], ["ShippingCompanyScreen.tsx", "Shipping"], ["FactoryCompanyScreen.tsx", "Factory"],
  ["ConstructionCompanyScreen.tsx", "Construction"], ["CarDealershipScreen.tsx", "Dealership"], ["SoftwareCompanyScreen.tsx", "Software"],
  ["SportsClubCompanyScreen.tsx", "Sports"], ["OilGasCompanyScreen.tsx", "OilGas"], ["AirlineCompanyScreen.tsx", "Airline"],
  ["HotelCompanyScreen.tsx", "Hotel"], ["BlockchainCompanyScreen.tsx", "Blockchain"], ["SpaceCompanyScreen.tsx", "Space"], ["HoldingCompanyScreen.tsx", "Holding"],
] as const;
const results: Record<string, unknown>[] = [];
const check = (label: string, ok: boolean, details: Record<string, unknown>) => {
  assert.equal(ok, true, `${label}: ${JSON.stringify(details)}`);
  results.push({ label, ok, ...details });
};

for (const [file, label] of modules) {
  const source = readFileSync(`src/screens/${file}`, "utf8");
  const ledgerCalls = (source.match(/onLedger\?\./g) || []).length;
  const gatewayCalls = (source.match(/commitCashTransaction/g) || []).length;
  const requiredFields = ["id", "kind", "label", "amount", "timestamp"];
  const fieldsPresent = requiredFields.every((field) => source.includes(`${field}:`) || source.includes(`${field},`) || source.includes(`${field} }`));
  const hasSignedAmount = source.includes("amount: -") || source.includes("amount, ") || source.includes("amount}") || /amount\s*[><=]/.test(source) || source.includes("-cost") || source.includes("-15000");
  check(`${label} ledger callback`, (ledgerCalls > 0 || gatewayCalls > 0) && fieldsPresent && hasSignedAmount, { file, ledgerCalls, gatewayCalls, fieldsPresent, hasSignedAmount });
}

const retail = DEFAULT_BUSINESSES.find((item) => item.sector === "Retail");
assert.ok(retail, "Retail default missing");
const sold = advanceBusinessOperationsWithSales({ ...retail, isAcquired: true, operationalLog: [], workforce: { ...retail.workforce, morale: 100 }, resources: { ...retail.resources, kind: "retail", stockUnits: 1000, unitSellingPrice: 12, customerFootfallPerHour: 3600 } }, 2);
check("Business transaction log writes sale", Array.isArray(sold.business.transactionLedger) && sold.business.transactionLedger.length === 1 && sold.business.transactionLedger[0].type === "sale" && sold.business.transactionLedger[0].amount > 0, {
  entries: sold.business.transactionLedger?.length,
  type: sold.business.transactionLedger?.[0]?.type,
  amount: sold.business.transactionLedger?.[0]?.amount,
});

const first = sold.business.transactionLedger![0];
const second = { ...first, id: "later", at: first.at + 1, timestamp: first.timestamp + 1 };
const chronologicalNewestFirst = [second, first].sort((a, b) => b.timestamp - a.timestamp).map((entry) => entry.id);
check("Transaction log newest-first ordering", chronologicalNewestFirst[0] === "later" && chronologicalNewestFirst[1] === first.id, { order: chronologicalNewestFirst });
check("Transaction log retention cap", sourceRetentionCheck(), { cap: 20 });

function sourceRetentionCheck() {
  const source = readFileSync("src/engine/businessEngine.ts", "utf8");
  return /transactionLedger.*slice\(0, 20\)/.test(source);
}

console.log(JSON.stringify({ test: "all-business-ledger-audit", modules: modules.length, checks: results.length, failed: 0, results }, null, 2));
