export const GAME_SAVE_VERSION = 2;

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
  return migrated;
}
