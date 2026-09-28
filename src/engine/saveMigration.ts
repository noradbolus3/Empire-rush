export const GAME_SAVE_VERSION = 6;

export type GameSaveRecord = Record<string, any> & { schemaVersion: number };

export function migrateGameSave(input: unknown): GameSaveRecord {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, any> : {};
  const version = Number.isFinite(source.schemaVersion) ? Number(source.schemaVersion) : 1;
  const migrated: GameSaveRecord = { ...source, schemaVersion: GAME_SAVE_VERSION };
  if (version < 2) {
    migrated.progression = source.progression || undefined;
    migrated.hapticsEnabled = source.hapticsEnabled !== false;
    migrated.soundEnabled = source.soundEnabled !== false;
    migrated.notificationsEnabled = source.notificationsEnabled !== false;
  }
  if (version < 3) {
    migrated.progression = { ...(source.progression || {}), tapCashToday: Number.isFinite(source.progression?.tapCashToday) ? source.progression.tapCashToday : 0 };
  }
  if (version < 4) {
    migrated.timeModel = "system-clock-v1";
    if (migrated.ipoListing && !migrated.ipoListing.listedAtTimestamp && Number.isFinite(migrated.ipoListing.listedAtGameTimestamp)) {
      migrated.ipoListing.listedAtTimestamp = migrated.ipoListing.listedAtGameTimestamp;
    }
    if (migrated.ipoListing && "listedAtGameTimestamp" in migrated.ipoListing) delete migrated.ipoListing.listedAtGameTimestamp;
  }
  if (version < 5) {
    migrated.timeModel = "system-clock-v1";
    migrated.settlementAt = Number.isFinite(source.settlementAt) ? source.settlementAt : Number.isFinite(source.saved) ? source.saved : Date.now();
  }
  if (version < 6) {
    const assets = Array.isArray(source.assets) ? source.assets : [];
    const holdings = source.holdings && typeof source.holdings === 'object' ? source.holdings : {};
    migrated.holdings = Object.fromEntries(Object.entries(holdings).map(([assetId, raw]) => {
      const holding = raw && typeof raw === 'object' ? raw as Record<string, any> : {};
      const asset = assets.find((item: any) => item?.id === assetId);
      const shares = Number.isFinite(holding.shares) ? Math.max(0, Number(holding.shares)) : 0;
      const avgPrice = Number.isFinite(holding.avgPrice) && Number(holding.avgPrice) > 0 ? Number(holding.avgPrice) : Number(asset?.price) || 0;
      const realizedPnl = Number.isFinite(holding.realizedPnl) ? Number(holding.realizedPnl) : Number(holding.realized) || 0;
      return [assetId, { shares, avgPrice, realized: realizedPnl, realizedPnl }];
    }));
    migrated.tradeHistory = Array.isArray(source.tradeHistory) ? source.tradeHistory : [];
  }
  return migrated;
}
