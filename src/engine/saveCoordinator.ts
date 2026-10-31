import AsyncStorage from "@react-native-async-storage/async-storage";

export const SAVE_TRANSACTION_JOURNAL = "empire-rush-save-transaction-v1";

type SaveStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

type SaveEntry = {
  key: string;
  value: string | null;
};

type PendingSave = {
  version: 1;
  transactionId: string;
  entries: SaveEntry[];
};

let writeQueue = Promise.resolve();

function storageOrDefault(storage?: SaveStorage): SaveStorage {
  return storage ?? (AsyncStorage as unknown as SaveStorage);
}

function transactionId() {
  return `save-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function applyEntries(entries: SaveEntry[], storage: SaveStorage) {
  for (const entry of entries) {
    if (entry.value === null) await storage.removeItem(entry.key);
    else await storage.setItem(entry.key, entry.value);
  }
}

export async function recoverPendingSave(
  storage?: SaveStorage,
): Promise<boolean> {
  const target = storageOrDefault(storage);
  const raw = await target.getItem(SAVE_TRANSACTION_JOURNAL);
  if (!raw) return false;
  let pending: PendingSave;
  try {
    const parsed = JSON.parse(raw) as PendingSave;
    if (
      parsed?.version !== 1 ||
      !Array.isArray(parsed.entries) ||
      parsed.entries.some(
        (entry) =>
          !entry ||
          typeof entry.key !== "string" ||
          !(typeof entry.value === "string" || entry.value === null),
      )
    )
      throw new Error("invalid save journal");
    pending = parsed;
  } catch {
    await target.removeItem(SAVE_TRANSACTION_JOURNAL);
    return false;
  }
  await applyEntries(pending.entries, target);
  await target.removeItem(SAVE_TRANSACTION_JOURNAL);
  return true;
}

export function coordinatedWrite(
  entries: SaveEntry[],
  storage?: SaveStorage,
): Promise<void> {
  const target = storageOrDefault(storage);
  const uniqueEntries = Array.from(
    new Map(entries.map((entry) => [entry.key, entry])).values(),
  );
  if (!uniqueEntries.length) return writeQueue;
  writeQueue = writeQueue.catch(() => undefined).then(async () => {
    const pending: PendingSave = {
      version: 1,
      transactionId: transactionId(),
      entries: uniqueEntries,
    };
    await target.setItem(SAVE_TRANSACTION_JOURNAL, JSON.stringify(pending));
    await applyEntries(uniqueEntries, target);
    await target.removeItem(SAVE_TRANSACTION_JOURNAL);
  });
  return writeQueue;
}

export type { SaveEntry, SaveStorage };
