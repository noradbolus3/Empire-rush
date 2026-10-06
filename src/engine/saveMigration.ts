export const GAME_SAVE_VERSION = 11;

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
  if (version < 7) {
    migrated.marketCatalogVersion = 'round17-fictional-v1';
    migrated.assets = Array.isArray(source.assets) ? source.assets : [];
  }
  if (version < 8) {
    migrated.tradeHistory = Array.isArray(source.tradeHistory) ? source.tradeHistory.filter((record: any) => record && typeof record === 'object' && typeof record.assetId === 'string') : [];
    migrated.watchlist = Array.isArray(source.watchlist) ? source.watchlist.filter((assetId: any) => typeof assetId === 'string') : [];
  }
  if (version < 9) {
    migrated.tradeHistory = Array.isArray(migrated.tradeHistory) ? migrated.tradeHistory.filter((record: any) => record && typeof record.assetId === 'string' && (record.side === 'BUY' || record.side === 'SELL') && Number.isFinite(record.quantity) && Number.isFinite(record.price)) : [];
    migrated.watchlist = Array.isArray(migrated.watchlist) ? [...new Set(migrated.watchlist.filter((assetId: any) => typeof assetId === 'string'))] : [];
    migrated.limitOrders = Array.isArray(source.limitOrders) ? source.limitOrders.filter((order: any) => order && typeof order.assetId === 'string' && (order.side === 'BUY' || order.side === 'SELL') && (order.status === 'OPEN' || order.status === 'FILLED' || order.status === 'CANCELLED') && Number.isFinite(order.quantity) && Number.isFinite(order.limitPrice)) : [];
    migrated.portfolioHistory = Array.isArray(source.portfolioHistory) ? source.portfolioHistory.filter((point: any) => point && Number.isFinite(point.timestamp) && Number.isFinite(point.value)).slice(-48) : [];
  }
  if (version < 10) {
    migrated.priceAlerts = Array.isArray(source.priceAlerts) ? source.priceAlerts.filter((alert: any) => alert && typeof alert.assetId === 'string' && typeof alert.symbol === 'string' && (alert.condition === 'ABOVE' || alert.condition === 'BELOW' || alert.condition === 'PCT_MOVE') && Number.isFinite(alert.target) && Number.isFinite(alert.baselinePrice)).slice(-50) : [];
  } else {
    migrated.priceAlerts = Array.isArray(source.priceAlerts) ? source.priceAlerts.filter((alert: any) => alert && typeof alert.assetId === 'string' && typeof alert.symbol === 'string' && (alert.condition === 'ABOVE' || alert.condition === 'BELOW' || alert.condition === 'PCT_MOVE') && Number.isFinite(alert.target) && Number.isFinite(alert.baselinePrice)).slice(-50) : [];
  }
  migrated.lastDividendQuarter = typeof source.lastDividendQuarter === 'string' ? source.lastDividendQuarter : '';
  migrated.marketEventHistory = Array.isArray(source.marketEventHistory)
    ? source.marketEventHistory.filter((event: any) => event && typeof event.id === 'string' && typeof event.headline === 'string' && Number.isFinite(event.tick)).slice(-24)
    : [];
  return migrated;
}
