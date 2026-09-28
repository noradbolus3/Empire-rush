import { STOCK_LOGOS } from './stockLogoData';

export type StockSector = 'TECH' | 'BANKING' | 'ENERGY' | 'PHARMA' | 'RETAIL' | 'MOBILITY' | 'AEROSPACE' | 'MEDIA' | 'REAL_ESTATE' | 'CONSUMER';
export interface StockDefinition { id: string; symbol: string; name: string; sector: StockSector; price: number; dividendYield: number; volatility: number; description: string; logo: number; }
export const STOCK_CATALOG: StockDefinition[] = [
  { id: 'arclight', symbol: 'ARC', name: 'Asteron Systems', sector: 'TECH', price: 920, dividendYield: 1.8, volatility: 0.018, description: 'Cloud security and automation platforms for mid-market operators.', logo: STOCK_LOGOS['arclight'] },
  { id: 'quanta', symbol: 'QNT', name: 'Meridian Gridworks', sector: 'ENERGY', price: 540, dividendYield: 2.4, volatility: 0.022, description: 'Grid storage software and distributed power infrastructure.', logo: STOCK_LOGOS['quanta'] },
  { id: 'sunpeak', symbol: 'SPK', name: 'Gridline Power', sector: 'ENERGY', price: 410, dividendYield: 2.1, volatility: 0.026, description: 'Utility-scale solar controls and resilient microgrids.', logo: STOCK_LOGOS['sunpeak'] },
  { id: 'northstar', symbol: 'NST', name: 'Heliox Therapeutics', sector: 'PHARMA', price: 690, dividendYield: 1.4, volatility: 0.03, description: 'Specialty therapies for chronic-care treatment pathways.', logo: STOCK_LOGOS['northstar'] },
  { id: 'vantage', symbol: 'VGT', name: 'Vertexa Mobility', sector: 'MOBILITY', price: 275, dividendYield: 0.6, volatility: 0.034, description: 'Fleet electrification and urban transport systems.', logo: STOCK_LOGOS['vantage'] },
  { id: 'beacon', symbol: 'BCN', name: 'Harborstone Financial', sector: 'BANKING', price: 355, dividendYield: 2.8, volatility: 0.038, description: 'Digital banking rails for small businesses and households.', logo: STOCK_LOGOS['beacon'] },
  { id: 'terrapower', symbol: 'TRP', name: 'Sunward Gridworks', sector: 'ENERGY', price: 625, dividendYield: 1.6, volatility: 0.042, description: 'Long-duration storage and clean industrial power.', logo: STOCK_LOGOS['terrapower'] },
  { id: 'orbit', symbol: 'ORB', name: 'Lumen Route Mobility', sector: 'MOBILITY', price: 190, dividendYield: 0.5, volatility: 0.018, description: 'Routing intelligence for autonomous and shared vehicles.', logo: STOCK_LOGOS['orbit'] },
  { id: 'brightforge', symbol: 'BFG', name: 'Brightforge Robotics', sector: 'TECH', price: 82, dividendYield: 0.4, volatility: 0.022, description: 'Warehouse robotics and adaptive machine vision.', logo: STOCK_LOGOS['brightforge'] },
  { id: 'civicmesh', symbol: 'CVM', name: 'CivicMesh Networks', sector: 'TECH', price: 146, dividendYield: 0.8, volatility: 0.026, description: 'Secure connectivity for municipal and enterprise networks.', logo: STOCK_LOGOS['civicmesh'] },
  { id: 'ledgerline', symbol: 'LDL', name: 'Ledgerline Capital', sector: 'BANKING', price: 58, dividendYield: 3.1, volatility: 0.03, description: 'Payments infrastructure and treasury software.', logo: STOCK_LOGOS['ledgerline'] },
  { id: 'clearwater', symbol: 'CLW', name: 'Clearwater Credit', sector: 'BANKING', price: 212, dividendYield: 2.6, volatility: 0.034, description: 'Consumer credit analytics and regional lending.', logo: STOCK_LOGOS['clearwater'] },
  { id: 'redwoodbio', symbol: 'RWB', name: 'Redwood BioWorks', sector: 'PHARMA', price: 36, dividendYield: 0.0, volatility: 0.038, description: 'Early-stage diagnostics and precision lab services.', logo: STOCK_LOGOS['redwoodbio'] },
  { id: 'novahealth', symbol: 'NVH', name: 'NovaHealth Devices', sector: 'PHARMA', price: 488, dividendYield: 1.1, volatility: 0.042, description: 'Connected clinical devices for outpatient care.', logo: STOCK_LOGOS['novahealth'] },
  { id: 'harborretail', symbol: 'HRT', name: 'Harbor & Field Retail', sector: 'RETAIL', price: 74, dividendYield: 2.0, volatility: 0.018, description: 'Omnichannel neighborhood retail and fulfillment.', logo: STOCK_LOGOS['harborretail'] },
  { id: 'marketnest', symbol: 'MKN', name: 'MarketNest Commerce', sector: 'RETAIL', price: 129, dividendYield: 1.2, volatility: 0.022, description: 'Marketplace tools for independent merchants.', logo: STOCK_LOGOS['marketnest'] },
  { id: 'ironvale', symbol: 'IRV', name: 'Ironvale Automotive', sector: 'MOBILITY', price: 54, dividendYield: 1.0, volatility: 0.026, description: 'Commercial vehicle components and service networks.', logo: STOCK_LOGOS['ironvale'] },
  { id: 'rallypoint', symbol: 'RPT', name: 'Rallypoint Transit', sector: 'MOBILITY', price: 318, dividendYield: 0.7, volatility: 0.03, description: 'High-capacity transit management systems.', logo: STOCK_LOGOS['rallypoint'] },
  { id: 'skylattice', symbol: 'SKL', name: 'Skylattice Aerospace', sector: 'AEROSPACE', price: 812, dividendYield: 0.3, volatility: 0.034, description: 'Lightweight structures for next-generation aircraft.', logo: STOCK_LOGOS['skylattice'] },
  { id: 'orbitalis', symbol: 'OBT', name: 'Orbitalis Systems', sector: 'AEROSPACE', price: 243, dividendYield: 0.2, volatility: 0.038, description: 'Satellite operations and launch logistics software.', logo: STOCK_LOGOS['orbitalis'] },
  { id: 'signalhouse', symbol: 'SGH', name: 'Signalhouse Media', sector: 'MEDIA', price: 47, dividendYield: 2.2, volatility: 0.042, description: 'Audio, video, and creator monetization networks.', logo: STOCK_LOGOS['signalhouse'] },
  { id: 'framefoundry', symbol: 'FFY', name: 'FrameFoundry Studios', sector: 'MEDIA', price: 166, dividendYield: 1.0, volatility: 0.018, description: 'Premium interactive entertainment production.', logo: STOCK_LOGOS['framefoundry'] },
  { id: 'terrafolio', symbol: 'TFO', name: 'Terrafolio Realty', sector: 'REAL_ESTATE', price: 93, dividendYield: 2.9, volatility: 0.022, description: 'Property operations and urban redevelopment services.', logo: STOCK_LOGOS['terrafolio'] },
  { id: 'bricklane', symbol: 'BRL', name: 'Bricklane Holdings', sector: 'REAL_ESTATE', price: 377, dividendYield: 3.4, volatility: 0.026, description: 'Income-producing commercial property portfolios.', logo: STOCK_LOGOS['bricklane'] },
  { id: 'morrowfoods', symbol: 'MFD', name: 'Morrow Foods', sector: 'CONSUMER', price: 28, dividendYield: 2.6, volatility: 0.03, description: 'Everyday packaged foods with regional distribution.', logo: STOCK_LOGOS['morrowfoods'] },
  { id: 'kineticwear', symbol: 'KNW', name: 'Kinetic Wear', sector: 'CONSUMER', price: 64, dividendYield: 1.8, volatility: 0.034, description: 'Performance apparel and connected fitness gear.', logo: STOCK_LOGOS['kineticwear'] },
  { id: 'blueharvest', symbol: 'BHV', name: 'BlueHarvest Nutrition', sector: 'CONSUMER', price: 112, dividendYield: 1.5, volatility: 0.038, description: 'Functional nutrition and sustainable ingredients.', logo: STOCK_LOGOS['blueharvest'] },
  { id: 'atlasbrands', symbol: 'ATB', name: 'Atlas Household Brands', sector: 'CONSUMER', price: 229, dividendYield: 2.3, volatility: 0.042, description: 'Durable home products with recurring replacement demand.', logo: STOCK_LOGOS['atlasbrands'] },
  { id: 'coastline', symbol: 'CSL', name: 'Coastline Leisure', sector: 'RETAIL', price: 265, dividendYield: 1.7, volatility: 0.018, description: 'Travel retail and experience-led commerce.', logo: STOCK_LOGOS['coastline'] },
  { id: 'meridianworks', symbol: 'MDW', name: 'Meridian Works', sector: 'TECH', price: 755, dividendYield: 1.0, volatility: 0.022, description: 'Enterprise software for complex physical operations.', logo: STOCK_LOGOS['meridianworks'] },
];

export const LEGACY_STOCK_NAME_MIGRATIONS: Record<string, string> = {
  'BrightGrid Energy': 'Gridline Power',
  'Surya Energy': 'Gridline Power',
  'Vahana Motors': 'Vertexa Mobility',
  'Bharat Bank': 'Harborstone Financial',
  'ArcLight Systems': 'Asteron Systems',
  'Northstar Pharma': 'Heliox Therapeutics',
  'Beacon Bank': 'Harborstone Financial',
};
