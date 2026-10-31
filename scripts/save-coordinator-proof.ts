import assert from "node:assert/strict";
import { coordinatedWrite, recoverPendingSave, SAVE_TRANSACTION_JOURNAL, SaveStorage } from "../src/engine/saveCoordinator";
import { GAME_SAVE_VERSION, migrateGameSave } from "../src/engine/saveMigration";
import { migrateBusinessSave, DEFAULT_BUSINESSES } from "../src/engine/businessSimulation";

class FakeStorage implements SaveStorage {
  values = new Map<string, string>();
  failOnKey: string | null = null;
  async getItem(key: string) { return this.values.get(key) ?? null; }
  async setItem(key: string, value: string) {
    if (this.failOnKey === key) throw new Error(`injected failure: ${key}`);
    this.values.set(key, value);
  }
  async removeItem(key: string) { this.values.delete(key); }
}

async function main() {
  const storage = new FakeStorage();
  storage.failOnKey = "specialized-company";
  await assert.rejects(
    coordinatedWrite([
      { key: "primary-save", value: JSON.stringify({ cash: 900 }) },
      { key: "specialized-company", value: JSON.stringify({ completedProjects: 4 }) },
    ], storage),
  );
  assert.ok(storage.values.has(SAVE_TRANSACTION_JOURNAL), "failed batch must leave a recovery journal");
  assert.equal(await storage.getItem("specialized-company"), null, "failed key must not be partially committed");
  storage.failOnKey = null;
  assert.equal(await recoverPendingSave(storage), true, "pending batch must recover");
  assert.equal(await storage.getItem(SAVE_TRANSACTION_JOURNAL), null, "recovery journal must clear after replay");
  assert.deepEqual(JSON.parse((await storage.getItem("primary-save"))!), { cash: 900 });
  assert.deepEqual(JSON.parse((await storage.getItem("specialized-company"))!), { completedProjects: 4 });

const legacy = migrateGameSave({
  saved: 123,
  cash: 500,
  ipoListing: { companyId: "legacy-company", listedAtGameTimestamp: 42 },
  holdings: { "asset-1": { shares: 2, avgPrice: 10 } },
});
assert.equal(legacy.schemaVersion, GAME_SAVE_VERSION);
assert.equal(legacy.settlementAt, 123);
assert.equal(legacy.ipoListing.listedAtTimestamp, 42);
assert.equal("listedAtGameTimestamp" in legacy.ipoListing, false);

const migratedBusinesses = migrateBusinessSave(DEFAULT_BUSINESSES.slice(0, 2));
assert.equal(migratedBusinesses.length, DEFAULT_BUSINESSES.length);
assert.ok(migratedBusinesses.some((item) => item.id === "cyberpulse-saas"));

  console.log(JSON.stringify({
    test: "save-coordinator-proof",
    status: "PASS",
    crashWindow: { journalCreated: true, replayed: true, journalCleared: true, keysRestored: 2 },
    migration: { gameSchemaVersion: legacy.schemaVersion, settlementAt: legacy.settlementAt, ipoTimestampMigrated: true, businessDefaultsRestored: migratedBusinesses.length },
    runtime: "helper-level deterministic storage; Android AsyncStorage restart NOT TESTED",
  }, null, 2));
}

void main();
