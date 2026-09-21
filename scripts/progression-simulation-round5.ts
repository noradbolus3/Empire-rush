import { DEFAULT_BUSINESSES, simulateBusinessTick } from '../src/engine/businessSimulation';
import { TAP_VALUE_CAP } from '../src/engine/tapUpgradeEngine';

type Profile = { label: string; tapsPerActiveMinute: number; activeMinutesPerHour: number };
type Snapshot = { checkpoint: string; cash: number; netWorth: number; acquiredBusinesses: number; taps: number; tapValue: number; retailStock: number; nextUnlock: string };

const profiles: Profile[] = [
  { label: 'casual', tapsPerActiveMinute: 6, activeMinutesPerHour: 2 },
  { label: 'regular', tapsPerActiveMinute: 15, activeMinutesPerHour: 10 },
  { label: 'hardcore', tapsPerActiveMinute: 30, activeMinutesPerHour: 25 },
];
const checkpoints = [
  { label: '10 minutes', minutes: 10 },
  { label: '1 hour', minutes: 60 },
  { label: '1 day', minutes: 24 * 60 },
  { label: '1 week', minutes: 7 * 24 * 60 },
  { label: '1 month', minutes: 30 * 24 * 60 },
];

function run(profile: Profile) {
  let cash = 5000;
  let taps = 0;
  let tapValue = 1;
  let businesses = DEFAULT_BUSINESSES.map(item => ({ ...item }));
  const snapshots: Snapshot[] = [];
  let checkpointIndex = 0;
  for (let minute = 1; minute <= checkpoints[checkpoints.length - 1].minutes; minute += 1) {
    const activeThisMinute = minute % 60 <= profile.activeMinutesPerHour;
    const tapsThisMinute = activeThisMinute ? profile.tapsPerActiveMinute : 0;
    taps += tapsThisMinute;
    tapValue = Math.min(TAP_VALUE_CAP, 1 + Math.floor(taps / 100) * 0.5);
    cash += tapsThisMinute * tapValue;

    const netWorthBeforePurchase = cash + businesses.reduce((sum, item) => sum + (item.isAcquired ? item.acquisitionCost : 0), 0);
    businesses = businesses.map(item => {
      if (item.isAcquired || (!item.isUnlocked && netWorthBeforePurchase < item.unlockNetWorthRequired) || cash < item.acquisitionCost) return item;
      cash -= item.acquisitionCost;
      return item.sector === 'Retail'
        ? { ...item, isAcquired: true, stockUnits: 1000, onboardingStep: 'WATCH_FIRST_SALE' as const }
        : { ...item, isAcquired: true };
    });

    const retail = businesses.find(item => item.sector === 'Retail');
    const retailStock = retail && 'stockUnits' in retail ? retail.stockUnits : 0;
    if (retail?.isAcquired && retailStock < 100 && cash >= 2000) {
      cash -= 2000;
      businesses = businesses.map(item => item.id === retail.id ? ({ ...item, stockUnits: retailStock + 1000 } as typeof item) : item);
    }
    const result = simulateBusinessTick(businesses, 60, 60);
    businesses = result.businesses;
    cash = Math.max(0, cash + result.cashDelta);

    if (checkpointIndex < checkpoints.length && minute >= checkpoints[checkpointIndex].minutes) {
      const currentNetWorth = cash + businesses.reduce((sum, item) => sum + (item.isAcquired ? item.acquisitionCost : 0), 0);
      const next = businesses.filter(item => !item.isAcquired).sort((a, b) => a.unlockNetWorthRequired - b.unlockNetWorthRequired)[0];
      const currentRetail = businesses.find(item => item.sector === 'Retail');
      snapshots.push({ checkpoint: checkpoints[checkpointIndex].label, cash: Number(cash.toFixed(2)), netWorth: Number(currentNetWorth.toFixed(2)), acquiredBusinesses: businesses.filter(item => item.isAcquired).length, taps, tapValue: Number(tapValue.toFixed(2)), retailStock: currentRetail && 'stockUnits' in currentRetail ? currentRetail.stockUnits : 0, nextUnlock: next?.name || 'All sectors acquired' });
      checkpointIndex += 1;
    }
  }
  return snapshots;
}

console.log(JSON.stringify(Object.fromEntries(profiles.map(profile => [profile.label, run(profile)])), null, 2));
