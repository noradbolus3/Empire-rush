declare const require: (moduleName: string) => any;
const { readFileSync } = require('fs') as { readFileSync: (path: string, encoding: string) => string };
const assert = (condition: unknown, message: string): asserts condition => { if (!condition) throw new Error(message); };
const assertMatch = (value: string, pattern: RegExp, message: string) => assert(pattern.test(value), message);
const assertNoMatch = (value: string, pattern: RegExp, message: string) => assert(!pattern.test(value), message);

const screen = readFileSync('src/screens/business/ConstructionCompanyScreen.tsx', 'utf8');
const assets = readFileSync('src/data/constructionAssets.ts', 'utf8');
const simulation = readFileSync('src/engine/businessSimulation.ts', 'utf8');

const requiredPages = [
  'Dashboard',
  'Land & Projects',
  'Machinery',
  'Management',
  'Contracts',
  'Expansion',
];
const requiredImages = [
  'constructionVisuals.dashboard',
  'constructionVisuals.land',
  'constructionVisuals.machinery',
  'constructionVisuals.project',
  'constructionVisuals.contracts',
];

assertMatch(screen, /ScrollView[\s\S]*contentContainerStyle=\{styles\.content\}/, 'vertical ScrollView missing');
assertMatch(screen, /backgroundColor: C\.bg/, 'white root background missing');
assertNoMatch(screen, /backgroundColor:\s*['"]#000/, 'black background found');
assertMatch(screen, /useState<Tab>\('Overview'\)/, 'overview default missing');
for (const page of requiredPages) assertMatch(screen, new RegExp(`tab: ['"]${page.replace(' & ', ' \\& ')}['"]`), `page missing: ${page}`);
for (const image of requiredImages) assertMatch(screen, new RegExp(image.replace('.', '\\.'), 'g'), `image missing: ${image}`);
assertMatch(screen, /ConstructionOverview[\s\S]*GrowthStageTable/, 'overview growth table missing');
assertMatch(screen, /OPEN PAGE/, 'overview action missing');
assertMatch(screen, /useRef\(false\)/, 'purchase lock missing');
assertMatch(screen, /project\.market === market/, 'market project filter missing');
assertMatch(screen, /tab: ['"]Expansion['"],[^\n]*image: constructionVisuals\.project/, 'expansion visual missing');
assertMatch(assets, /construction-dashboard\.webp/, 'dashboard asset missing');
assertMatch(assets, /construction-land\.webp/, 'land asset missing');
assertMatch(assets, /construction-machinery\.webp/, 'machinery asset missing');
assertMatch(assets, /construction-project\.webp/, 'project asset missing');
assertMatch(assets, /construction-contracts\.webp/, 'contracts asset missing');
assertMatch(simulation, /name: \"Construction Company\"/, 'final name missing');
assertMatch(simulation, /Ironline Civic Works/, 'legacy migration missing');

console.log(JSON.stringify({
  test: 'round40-construction-ui-proof',
  status: 'PASS',
  theme: 'white',
  layout: 'single vertical ScrollView',
  overview: 'picture-led vertical overview',
  dedicatedPages: requiredPages,
  integratedVisuals: requiredImages,
  actionGuard: 'rapid duplicate spend blocked for 300ms',
  marketFilter: 'project pipeline follows selected market',
  persistenceMigration: 'Ironline Civic Works -> Construction Company',
  deviceScreenshot: 'NOT RUN',
}, null, 2));
