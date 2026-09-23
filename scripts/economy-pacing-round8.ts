type Profile = { label: string; tapsPerActiveMinute: number; activeMinutesPerHour: number; reinvestmentRate: number };
type Snapshot = { hour: number; netWorth: number; cash: number; businesses: string[]; tapValue: number; passivePerHour: number; ipo: boolean; billionaire: boolean };
const STARTING_CASH = 1_000;
const IPO_GATE = 10_000_000;
const IPO_CAP_MULTIPLE = 0.5;
const profiles: Profile[] = [
  { label: 'casual', tapsPerActiveMinute: 10, activeMinutesPerHour: 20, reinvestmentRate: 0.72 },
  { label: 'regular', tapsPerActiveMinute: 20, activeMinutesPerHour: 20, reinvestmentRate: 0.84 },
  { label: 'hardcore', tapsPerActiveMinute: 30, activeMinutesPerHour: 40, reinvestmentRate: 0.92 },
];
const businesses = [
  { id: 'retail', name: 'Copper & Bloom Market', unlock: 0, cost: 1_000, profit: 6_000 },
  { id: 'mobility', name: 'Neon Mile Fleet', unlock: 15_000, cost: 12_000, profit: 22_000 },
  { id: 'saas', name: 'SignalForge Cloud', unlock: 75_000, cost: 60_000, profit: 70_000 },
  { id: 'construction', name: 'Ironline Civic Works', unlock: 250_000, cost: 180_000, profit: 250_000 },
  { id: 'realestate', name: 'Harborlight Properties', unlock: 750_000, cost: 550_000, profit: 650_000 },
  { id: 'energy', name: 'Sunward Gridworks', unlock: 2_500_000, cost: 1_800_000, profit: 1_200_000 },
  { id: 'pharma', name: 'Northstar Therapeutics', unlock: 8_000_000, cost: 5_500_000, profit: 3_000_000 },
  { id: 'media', name: 'Signal & Story Studios', unlock: 25_000_000, cost: 16_000_000, profit: 6_000_000 },
  { id: 'sports', name: 'Fastbreak Atlas', unlock: 80_000_000, cost: 52_000_000, profit: 20_000_000 },
  { id: 'airline', name: 'BlueArc Air', unlock: 250_000_000, cost: 160_000_000, profit: 30_000_000 },
];
const targetHours = { million: 18, billionaire: 52 };
function tapGain(tapValue: number, profile: Profile, hour: number) { const activeMinutes = Math.min(profile.activeMinutesPerHour, Math.max(0, 60 - (hour % 60))); return activeMinutes * profile.tapsPerActiveMinute * tapValue; }
function tapUpgradeCost(level: number) { return Math.round(180 * Math.pow(1.28, level)); }
function run(profile: Profile) {
  let cash = STARTING_CASH; let tapValue = 1; let tapLevel = 0; let ipo = false; let ipoBusiness = ''; let taps = 0; let tapCashToday = 0; let passivePerHour = 0; let previousNetWorth = STARTING_CASH; let maxStepMultiple = 1; let minNetWorth = STARTING_CASH; const rampHours: Record<string, number> = {}; const owned: typeof businesses = []; const snapshots: Snapshot[] = []; let millionHour: number | null = null; let billionaireHour: number | null = null;
  for (let hour = 1; hour <= 72; hour += 1) {
    if ((hour - 1) % 24 === 0) tapCashToday = 0;
    const currentNetWorth = cash + owned.reduce((sum, business) => sum + business.cost, 0);
    const tapCash = Math.min(tapGain(tapValue, profile, hour), Math.max(0, Math.max(1_000, currentNetWorth * 0.02) - tapCashToday));
    tapCashToday += tapCash;
    taps += profile.activeMinutesPerHour * profile.tapsPerActiveMinute;
    cash += tapCash;
    if (owned.length > 0 && cash >= tapUpgradeCost(tapLevel) && tapLevel < 9) { cash -= tapUpgradeCost(tapLevel); tapLevel += 1; tapValue = Number(Math.min(10, tapValue + 0.5).toFixed(2)); }
    const netWorthBefore = cash + owned.reduce((sum, business) => sum + business.cost, 0);
    const producingBusinesses = owned.slice();
    const next = businesses.find(business => !owned.includes(business) && netWorthBefore >= business.unlock && cash >= business.cost && (!owned.length || business.id !== 'retail' || cash >= business.cost));
    if (next && cash >= next.cost && (next.id === 'retail' || owned.length > 0)) { cash -= next.cost; owned.push(next); rampHours[next.id] = 0; }
    for (const business of producingBusinesses) rampHours[business.id] = Math.min(4, (rampHours[business.id] || 0) + 1);
    const baseProfit = producingBusinesses.reduce((sum, business) => sum + business.profit * Math.min(1, (rampHours[business.id] || 0) / 4), 0);
    const synergy = 1 + Math.min(0.2, Math.max(0, producingBusinesses.length - 1) * 0.03);
    passivePerHour = baseProfit * synergy;
    const passiveCash = passivePerHour;
    cash += passiveCash;
    const netWorthBeforeIpo = cash + owned.reduce((sum, business) => sum + business.cost, 0);
    if (!ipo && netWorthBeforeIpo >= IPO_GATE && owned.length >= 5) { ipo = true; ipoBusiness = owned[0].id; cash += Math.min(netWorthBeforeIpo * IPO_CAP_MULTIPLE, netWorthBeforeIpo * IPO_CAP_MULTIPLE); }
    if (ipo) { passivePerHour = owned.reduce((sum, business) => sum + business.profit * (business.id === ipoBusiness ? 0.8 : 1), 0) * synergy; }
    const netWorth = cash + owned.reduce((sum, business) => sum + business.cost, 0);
    maxStepMultiple = Math.max(maxStepMultiple, netWorth / Math.max(1, previousNetWorth));
    minNetWorth = Math.min(minNetWorth, netWorth);
    previousNetWorth = netWorth;
    if (netWorth >= 1_000_000 && millionHour === null) millionHour = hour;
    if (netWorth >= 1_000_000_000 && billionaireHour === null) billionaireHour = hour;
    if ([1, 5, 10, 15, 18, 20, 30, 40, 52, 60, 72].includes(hour)) snapshots.push({ hour, netWorth: Math.round(netWorth), cash: Math.round(cash), businesses: owned.map(business => business.id), tapValue, passivePerHour: Math.round(passivePerHour), ipo, billionaire: netWorth >= 1_000_000_000 });
  }
  return { checkpoints: snapshots, millionHour, billionaireHour, finalNetWorth: snapshots.at(-1)?.netWorth, ipoBusiness, taps, maxStepMultiple: Number(maxStepMultiple.toFixed(3)), minNetWorth: Number(minNetWorth.toFixed(2)) };
}
const output = Object.fromEntries(profiles.map(profile => [profile.label, run(profile)]));
if (output.casual.millionHour === null || output.casual.millionHour < 15 || output.casual.millionHour > 20) throw new Error(`Casual millionaire target missed: ${output.casual.millionHour}`);
if (output.casual.billionaireHour === null || output.casual.billionaireHour < 40 || output.casual.billionaireHour > 60) throw new Error(`Casual billionaire target missed: ${output.casual.billionaireHour}`);
for (const [label, result] of Object.entries(output)) { if (result.minNetWorth < 0) throw new Error(`${label} net worth fell below zero`); if (result.maxStepMultiple > 4) throw new Error(`${label} economy spike exceeded 4x in one hour`); }
console.log(JSON.stringify({ targets: targetHours, output }, null, 2));
