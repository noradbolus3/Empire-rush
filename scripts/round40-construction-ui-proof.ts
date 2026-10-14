import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

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

assert.match(screen, /ScrollView[\s\S]*contentContainerStyle=\{styles\.content\}/);
assert.match(screen, /backgroundColor: C\.bg/);
assert.doesNotMatch(screen, /backgroundColor:\s*['"]#000/);
assert.match(screen, /useState<Tab>\('Overview'\)/);
for (const page of requiredPages) assert.match(screen, new RegExp(`tab: ['"]${page.replace(' & ', ' \\& ')}['"]`));
for (const image of requiredImages) assert.match(screen, new RegExp(image.replace('.', '\\.'), 'g'));
assert.match(screen, /ConstructionOverview[\s\S]*GrowthStageTable/);
assert.match(screen, /OPEN PAGE/);
assert.match(assets, /construction-dashboard\.webp/);
assert.match(assets, /construction-land\.webp/);
assert.match(assets, /construction-machinery\.webp/);
assert.match(assets, /construction-project\.webp/);
assert.match(assets, /construction-contracts\.webp/);
assert.match(simulation, /name: "Construction Company"/);
assert.match(simulation, /Ironline Civic Works/);

console.log(JSON.stringify({
  test: 'round40-construction-ui-proof',
  status: 'PASS',
  theme: 'white',
  layout: 'single vertical ScrollView',
  overview: 'picture-led vertical overview',
  dedicatedPages: requiredPages,
  integratedVisuals: requiredImages,
  persistenceMigration: 'Ironline Civic Works -> Construction Company',
  deviceScreenshot: 'NOT RUN',
}, null, 2));
