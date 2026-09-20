export interface ProgressionState {
  lastLoginDay: string;
  loginStreak: number;
  tapsToday: number;
  dailyTapGoal: number;
  missionClaimed: boolean;
  totalTaps: number;
  totalUpgrades: number;
}

export const DEFAULT_PROGRESSION: ProgressionState = {
  lastLoginDay: '',
  loginStreak: 0,
  tapsToday: 0,
  dailyTapGoal: 25,
  missionClaimed: false,
  totalTaps: 0,
  totalUpgrades: 0,
};

export function dayKey(timestamp = Date.now()): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function hydrateDailyProgress(saved: Partial<ProgressionState> | null | undefined, timestamp = Date.now()): ProgressionState {
  const previous = { ...DEFAULT_PROGRESSION, ...(saved || {}) };
  const today = dayKey(timestamp);
  if (!previous.lastLoginDay) return { ...previous, lastLoginDay: today, loginStreak: 1 };
  if (previous.lastLoginDay === today) return previous;
  const previousDate = new Date(`${previous.lastLoginDay}T00:00:00.000Z`).getTime();
  const todayDate = new Date(`${today}T00:00:00.000Z`).getTime();
  const isConsecutive = todayDate - previousDate === 86400000;
  return { ...previous, lastLoginDay: today, loginStreak: isConsecutive ? previous.loginStreak + 1 : 1, tapsToday: 0, missionClaimed: false };
}
