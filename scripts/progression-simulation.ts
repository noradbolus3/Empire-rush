import { DEFAULT_BUSINESSES, simulateBusinessTick } from '../src/engine/businessSimulation';

const horizons = [
  { label: '1 hour', seconds: 60 * 60 },
  { label: '1 day', seconds: 24 * 60 * 60 },
  { label: '1 week', seconds: 7 * 24 * 60 * 60 },
  { label: '1 month', seconds: 30 * 24 * 60 * 60 },
];

let cash = 5000;
let businesses = DEFAULT_BUSINESSES.map(item => ({ ...item }));
let taps = 0;
let clickValue = 1;
let nextHorizon = 0;
const stepSeconds = 60;
const snapshots: Array<{ label: string; cash: number; netWorth: number; acquired: number; taps: number; nextUnlock: string }> = [];

const acquireEligible = () => {
  const currentNetWorth = cash + businesses.reduce((sum, item) => sum + (item.isAcquired ? item.acquisitionCost : 0), 0);
  businesses = businesses.map(item => {
    if (item.isAcquired || (!item.isUnlocked && currentNetWorth < item.unlockNetWorthRequired) || cash < item.acquisitionCost) return item;
    cash -= item.acquisitionCost;
    if (item.sector === 'Retail') return { ...item, isAcquired: true, stockUnits: 1000, onboardingStep: 'WATCH_FIRST_SALE' as const };
    return { ...item, isAcquired: true };
  });
};

for (let elapsed = stepSeconds; elapsed <= horizons[horizons.length - 1].seconds; elapsed += stepSeconds) {
  const tapsThisStep = elapsed <= 15 * 60 ? 20 : 5;
  taps += tapsThisStep;
  clickValue = Math.min(10, 1 + Math.floor(taps / 100) * 0.5);
  cash += tapsThisStep * clickValue;
  acquireEligible();
  const retail = businesses.find(item => item.sector === 'Retail');
  const retailStock = retail && 'stockUnits' in retail ? retail.stockUnits : 0;
  if (retail?.isAcquired && retailStock < 100) {
    if (cash >= 2000) {
      cash -= 2000;
      businesses = businesses.map(item => item.id === retail.id ? ({ ...item, stockUnits: retailStock + 1000 } as typeof item) : item);
    }
  }
  const result = simulateBusinessTick(businesses, stepSeconds, stepSeconds);
  businesses = result.businesses;
  cash = Math.max(0, cash + result.cashDelta);
  if (elapsed >= horizons[nextHorizon].seconds) {
    const netWorth = cash + businesses.reduce((sum, item) => sum + (item.isAcquired ? item.acquisitionCost : 0), 0);
    const next = businesses.filter(item => !item.isAcquired).sort((a, b) => a.unlockNetWorthRequired - b.unlockNetWorthRequired)[0];
    snapshots.push({ label: horizons[nextHorizon].label, cash: Number(cash.toFixed(2)), netWorth: Number(netWorth.toFixed(2)), acquired: businesses.filter(item => item.isAcquired).length, taps, nextUnlock: next?.name || 'All sectors acquired' });
    nextHorizon += 1;
    if (nextHorizon >= horizons.length) break;
  }
}

console.log(JSON.stringify({ startCash: 5000, snapshots }, null, 2));
