import { businessValuation, capIPOProceeds, createIPOListing, founderOwnershipFraction } from '../src/engine/ipoEngine';
import { DEFAULT_BUSINESSES, passiveIncomeMultiplier, simulateBusinessTick } from '../src/engine/businessSimulation';
import { tapUpgradeCost, tapUpgradeGain } from '../src/engine/tapUpgradeEngine';
import { RetailData } from '../src/types/business';

type Point = { phase: string; netWorth: number; cash: number; hourlyProfit: number; founderShare: number };

const retail = { ...DEFAULT_BUSINESSES.find(item => item.sector === 'Retail')!, isAcquired: true, stockUnits: 2500, hourlyNetProfit: 11300, autoRestockEnabled: true } as RetailData;
const IPO_NET_WORTH_GATE = 1_000_000;
let cash = 700_000;
let business: RetailData = retail;
const before: Point[] = [];
const after: Point[] = [];

function netWorth() { return cash + business.acquisitionCost + business.stockUnits * (business.unitWholesaleCost ?? 2) + (business.autoRestockEnabled ? 1500 : 0); }
function snapshot(target: Point[], phase: string, founderShare = 1) { target.push({ phase, netWorth: Number(netWorth().toFixed(2)), cash: Number(cash.toFixed(2)), hourlyProfit: Number((business.hourlyNetProfit * founderShare).toFixed(2)), founderShare }); }

for (let minute = 1; minute <= 6; minute += 1) {
  const result = simulateBusinessTick([business], 60, 60, cash, {}, netWorth());
  business = result.businesses[0] as RetailData;
  cash += result.cashDelta;
  snapshot(before, `pre-IPO minute ${minute}`);
}
// Normalize the deterministic event to the requested $1M gate so the comparison is easy to audit.
cash += IPO_NET_WORTH_GATE - netWorth();
if (netWorth() < IPO_NET_WORTH_GATE) throw new Error(`IPO gate setup failed: ${netWorth()}`);
snapshot(before, 'pre-IPO gate · $1M net worth');
const listing = createIPOListing(business, 1_767_000_000_000, 'CBM', netWorth());
const safeListing = capIPOProceeds(listing, netWorth());
const founderShare = founderOwnershipFraction(safeListing);
const legacyAfterIPO = netWorth() + 22_800_000;
const fixedBeforeIPO = netWorth();
cash += safeListing.capitalRaised;
snapshot(after, 'IPO close · immediately after capital raise', founderShare);
for (let minute = 1; minute <= 6; minute += 1) {
  const result = simulateBusinessTick([business], 60, 60, cash, { [business.id]: founderShare }, netWorth());
  business = result.businesses[0] as RetailData;
  cash += result.cashDelta;
  snapshot(after, `post-IPO minute ${minute}`, founderShare);
}
const allPoints = [...before, ...after];
const maxStepMultiple = allPoints.slice(1).reduce((max, point, index) => Math.max(max, point.netWorth / Math.max(1, allPoints[index].netWorth)), 0);
if (safeListing.capitalRaised > IPO_NET_WORTH_GATE * 3) throw new Error('IPO proceeds exceeded the 3x net-worth cap');
if (maxStepMultiple > 4) throw new Error(`IPO curve spike exceeded 4x: ${maxStepMultiple}`);
if (after[0].hourlyProfit >= before[before.length - 1].hourlyProfit) throw new Error('Founder cashflow was not diluted after IPO');
console.log(JSON.stringify({
  before: { netWorth: Number(fixedBeforeIPO.toFixed(2)), grossListingProceeds: listing.capitalRaised, hourlyProfit: 11300 },
  legacyExploit: { cashInjection: 22_800_000, afterIPO: { netWorth: Number(legacyAfterIPO.toFixed(2)) }, multiple: Number((legacyAfterIPO / fixedBeforeIPO).toFixed(2)) },
  fixedIPO: { cashInjection: safeListing.capitalRaised, afterIPO: { netWorth: after[0].netWorth }, multiple: Number((after[0].netWorth / fixedBeforeIPO).toFixed(2)), publicFloat: 0.2, founderOwnership: founderShare, postIPOHourlyProfit: Number((business.hourlyNetProfit * founderShare).toFixed(2)) },
  tapROI: { level: 17, cost: tapUpgradeCost(17), gain: tapUpgradeGain(17, 9.5), paybackMinutesAtOneTapPerSecond: Number((tapUpgradeCost(17) / tapUpgradeGain(17, 9.5) / 60).toFixed(2)) },
  passiveScaling: [0, 25_000, 1_000_000, 100_000_000].map(value => ({ netWorth: value, multiplier: passiveIncomeMultiplier(value) })),
  curve: allPoints,
  maxStepMultiple: Number(maxStepMultiple.toFixed(2)),
  result: 'PASS'
}, null, 2));
