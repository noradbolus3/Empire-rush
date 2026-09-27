export type RealTimeSnapshot = {
  timestamp: number;
  dayKey: string;
  weekKey: string;
  quarterKey: string;
};

export function readSystemTimeMs(): number {
  return Date.now();
}

export function dayKeyFromSystemTime(timestamp = readSystemTimeMs()): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function weekKeyFromSystemTime(timestamp = readSystemTimeMs()): string {
  const date = new Date(timestamp);
  const start = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - start.getTime()) / 86400000) + 1;
  const week = Math.ceil((dayOfYear + start.getDay()) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function quarterKeyFromSystemTime(timestamp = readSystemTimeMs()): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
}

export function formatSystemDateTime(timestamp = readSystemTimeMs()): string {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function createRealTimeSnapshot(timestamp = readSystemTimeMs()): RealTimeSnapshot {
  return {
    timestamp,
    dayKey: dayKeyFromSystemTime(timestamp),
    weekKey: weekKeyFromSystemTime(timestamp),
    quarterKey: quarterKeyFromSystemTime(timestamp),
  };
}
