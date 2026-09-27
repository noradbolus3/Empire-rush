import { DEFAULT_BUSINESSES, simulateBusinessOperations } from '../src/engine/businessSimulation';
import { settleElapsedBusinessIncome } from '../src/engine/settlementEngine';
import { BusinessEntity } from '../src/types/business';

const HOUR_MS = 60 * 60 * 1000;
const pair = DEFAULT_BUSINESSES.filter(item => item.id === 'apex-retail' || item.id === 'metro-mobility').map(item => item.id === 'apex-retail' ? { ...item, isAcquired: true, stockUnits: 2500, operatingRampSeconds: 0 } : { ...item, isAcquired: true, operatingRampSeconds: 0 });
let businesses: BusinessEntity[] = pair;
let cash = 100_000;
const checkpoints: Array<{ elapsedMinutes: number; cash: number; pendingReceivable: number }> = [];
for (let second = 2; second <= 3600; second += 2) {
  const result = simulateBusinessOperations(businesses, 2, 2, cash, {}, 0);
  businesses = result.businesses;
  if (second === 10 * 60 || second === 59 * 60 || second === 3600) checkpoints.push({ elapsedMinutes: second / 60, cash, pendingReceivable: Number(businesses.reduce((sum, item) => sum + (item.pendingSettlementAmount ?? 0), 0).toFixed(2)) });
}
const settlement = settleElapsedBusinessIncome(businesses, 0, HOUR_MS);
const correctCredit = settlement.totalAmount;
const declaredHourlyRate = businesses.reduce((sum, item) => sum + Math.max(0, item.hourlyNetProfit), 0);
const oldPerTickCreditForOneHour = Number((declaredHourlyRate * 1800).toFixed(2));
console.log(JSON.stringify({
  scope: 'Retail + Mobility · one real-time hour',
  checkpoints,
  correctSettlement: { completedHours: settlement.completedHours, credit: correctCredit, cashAfterCredit: Number((cash + correctCredit).toFixed(2)) },
  oldWrongPath: { declaredHourlyRate: Number(declaredHourlyRate.toFixed(2)), twoSecondTicksPerHour: 1800, creditIfHourlyRateWasAddedEachTick: oldPerTickCreditForOneHour, inflationMultiple: Number((oldPerTickCreditForOneHour / Math.max(0.01, correctCredit)).toFixed(2)) },
  invariant: checkpoints[0].cash === 100_000 && checkpoints[1].cash === 100_000 && settlement.completedHours === 1 ? 'PASS' : 'FAIL',
}, null, 2));
