import AsyncStorage from '@react-native-async-storage/async-storage';

export const GAME_TIME_STORAGE_KEY = 'empire-rush-simulated-clock-v1';
export const GAME_START_TIMESTAMP = Date.UTC(2026, 0, 1, 9, 0, 0, 0);
export const GAME_MINUTES_PER_REAL_SECOND = 5;
const GAME_MILLISECONDS_PER_REAL_MILLISECOND = GAME_MINUTES_PER_REAL_SECOND * 60;

export interface SimulatedGameTime {
  gameTimestamp: number;
  lastRealTimestamp: number;
}

export function createInitialGameTime(realTimestamp = Date.now()): SimulatedGameTime {
  return { gameTimestamp: GAME_START_TIMESTAMP, lastRealTimestamp: realTimestamp };
}

export function advanceGameTime(state: SimulatedGameTime, realTimestamp = Date.now()): SimulatedGameTime {
  const elapsed = Math.max(0, realTimestamp - state.lastRealTimestamp);
  return {
    gameTimestamp: state.gameTimestamp + elapsed * GAME_MILLISECONDS_PER_REAL_MILLISECOND,
    lastRealTimestamp: realTimestamp,
  };
}

export async function loadGameTime(): Promise<SimulatedGameTime> {
  try {
    const raw = await AsyncStorage.getItem(GAME_TIME_STORAGE_KEY);
    if (!raw) {
      const initial = createInitialGameTime();
      await persistGameTime(initial);
      return initial;
    }
    const saved = JSON.parse(raw) as Partial<SimulatedGameTime>;
    if (!Number.isFinite(saved.gameTimestamp) || !Number.isFinite(saved.lastRealTimestamp)) {
      const initial = createInitialGameTime();
      await persistGameTime(initial);
      return initial;
    }
    return advanceGameTime({ gameTimestamp: saved.gameTimestamp as number, lastRealTimestamp: saved.lastRealTimestamp as number });
  } catch {
    return createInitialGameTime();
  }
}

export async function persistGameTime(state: SimulatedGameTime): Promise<void> {
  await AsyncStorage.setItem(GAME_TIME_STORAGE_KEY, JSON.stringify(state));
}

function getQuarter(month: number): string {
  return `Q${Math.floor(month / 3) + 1}`;
}

function ordinalDay(day: number): string {
  if (day % 10 === 1 && day % 100 !== 11) return `${day}ST`;
  if (day % 10 === 2 && day % 100 !== 12) return `${day}ND`;
  if (day % 10 === 3 && day % 100 !== 13) return `${day}RD`;
  return `${day}TH`;
}

export function formatSimulatedGameTime(timestamp: number): string {
  const date = new Date(timestamp);
  const quarter = getQuarter(date.getUTCMonth());
  const hour24 = date.getUTCHours();
  const hour12 = hour24 % 12 || 12;
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  const meridiem = hour24 >= 12 ? 'PM' : 'AM';
  return `[${quarter} ${date.getUTCFullYear()}] DAY ${ordinalDay(date.getUTCDate())} • ${hour12}:${minute} ${meridiem}`;
}
