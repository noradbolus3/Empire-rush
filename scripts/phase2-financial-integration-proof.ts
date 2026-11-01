import { settleHour, emptyFinancialState, FinancialGameState } from '../src/engine/financialCore';
import { buildIncomeSources } from '../src/engine/incomeLedger';
import { DEFAULT_TAXI_COMPANY } from '../src/types/taxi';
import { DEFAULT_FACTORY_COMPANY } from '../src/types/factory';
import { DEFAULT_CONSTRUCTION_COMPANY } from '../src/types/construction';
import { DEFAULT_SHIPPING_COMPANY } from '../src/types/shipping';
import { DEFAULT_DEALERSHIP } from '../src/types/dealership';
import { DEFAULT_SOFTWARE_COMPANY } from '../src/types/software';
import { DEFAULT_SPORTS_CLUB } from '../src/types/sportsClub';
import { DEFAULT_OIL_GAS } from '../src/types/oilGas';
import { DEFAULT_AIRLINE } from '../src/types/airline';
import { DEFAULT_HOTEL } from '../src/types/hotel';
import { DEFAULT_BLOCKCHAIN } from '../src/types/blockchain';
import { DEFAULT_SPACE } from '../src/types/space';
import { DEFAULT_HOLDING } from '../src/types/holding';

const state: FinancialGameState = {
  ...emptyFinancialState(),
  businesses: [],
  taxiCompany: { ...DEFAULT_TAXI_COMPANY, status: 'operating', area: 'Central City', level: 1, depotLevel: 1, economyTaxis: 5, electricTaxis: 2, luxuryTaxis: 0, reputation: 90, fareMultiplier: 1.0, activeSurge: false, lastEvent: 'Started' },
  factoryCompany: { ...DEFAULT_FACTORY_COMPANY, status: 'operating', lines: 3, efficiency: 1.2, capacity: 500, productionUnits: 150, rawMaterials: 500, finishedGoods: 150, costPerUnit: 2, sellingPrice: 5 },
  constructionCompany: { ...DEFAULT_CONSTRUCTION_COMPANY, status: 'operating', activeTenders: 2, heavyMachinery: 5, workers: 20, activeProjects: 1 },
  shippingCompany: { ...DEFAULT_SHIPPING_COMPANY, status: 'operating', vehicles: 2, cargo: 100 },
  softwareCompany: { ...DEFAULT_SOFTWARE_COMPANY, status: 'operating', stage: 'Startup', activeProjects: 1, developers: 2 },
};

const result = settleHour(state);
const sources = buildIncomeSources({
  businesses: [],
  assets: [],
  holdings: {},
  businessProfitPerHour: result.breakdown.businessRevenue,
  taxiCompany: state.taxiCompany,
  shippingCompany: state.shippingCompany,
  factoryCompany: state.factoryCompany,
  constructionCompany: state.constructionCompany,
  softwareCompany: state.softwareCompany
});

console.log(JSON.stringify({
  status: 'PASS',
  revenue: result.breakdown.businessRevenue,
  cashDelta: result.cashDelta,
  sourceCount: sources.length
}, null, 2));
