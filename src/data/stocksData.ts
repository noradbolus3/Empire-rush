import { STOCK_LOGOS } from './stockLogoData';

export type StockSector = 'TECH' | 'BANKING' | 'ENERGY' | 'PHARMA' | 'RETAIL' | 'MOBILITY' | 'AEROSPACE' | 'MEDIA' | 'REAL_ESTATE' | 'CONSUMER' | 'AI_CHIP' | 'CONSUMER_TECH' | 'ELECTRONICS' | 'SOFTWARE' | 'SOCIAL_TECH' | 'FINTECH' | 'PAYMENTS' | 'FINANCE' | 'TRAVEL';
export interface StockDefinition { id: string; symbol: string; name: string; sector: StockSector; price: number; dividendYield: number; volatility: number; description: string; logo: number; }

// Immutable Round 25 display catalog. Legacy IDs are retained so holdings migrate without duplication.
export const STOCK_CATALOG: StockDefinition[] = [
  { id:'arclight', symbol:'MSFT', name:'MicroSift', sector:'TECH', price:415.26, dividendYield:0.8, volatility:.018, description:'Cloud software and enterprise productivity systems.', logo:STOCK_LOGOS.arclight },
  { id:'quanta', symbol:'GGL', name:'Guglo', sector:'TECH', price:162.77, dividendYield:0.5, volatility:.022, description:'Search, discovery, and digital advertising infrastructure.', logo:STOCK_LOGOS.quanta },
  { id:'sunpeak', symbol:'AMZN', name:'Amazone', sector:'RETAIL', price:178.91, dividendYield:0.4, volatility:.026, description:'Global commerce, logistics, and cloud storefronts.', logo:STOCK_LOGOS.sunpeak },
  { id:'northstar', symbol:'TSLH', name:'Teslah', sector:'MOBILITY', price:268.14, dividendYield:0.2, volatility:.03, description:'Electric mobility and energy storage systems.', logo:STOCK_LOGOS.northstar },
  { id:'vantage', symbol:'NVDY', name:'Nvidiya', sector:'AI_CHIP', price:742.33, dividendYield:0.1, volatility:.034, description:'Accelerated computing and intelligent hardware.', logo:STOCK_LOGOS.vantage },
  { id:'beacon', symbol:'NFLX', name:'Netfliks', sector:'MEDIA', price:487.22, dividendYield:0, volatility:.038, description:'Subscription entertainment and streaming media.', logo:STOCK_LOGOS.beacon },
  { id:'terrapower', symbol:'APLX', name:'Applix', sector:'CONSUMER_TECH', price:228.45, dividendYield:0.6, volatility:.042, description:'Consumer devices and connected services.', logo:STOCK_LOGOS.terrapower },
  { id:'orbit', symbol:'SMSG', name:'Samsong', sector:'ELECTRONICS', price:132.45, dividendYield:1.1, volatility:.018, description:'Displays, devices, and industrial electronics.', logo:STOCK_LOGOS.orbit },
  { id:'brightforge', symbol:'TYD', name:'Toyoda Motors', sector:'MOBILITY', price:196.18, dividendYield:1.5, volatility:.022, description:'Mass-market vehicles and mobility components.', logo:STOCK_LOGOS.brightforge },
  { id:'civicmesh', symbol:'CCRA', name:'CocaCora', sector:'CONSUMER', price:61.24, dividendYield:2.8, volatility:.026, description:'Beverages and global consumer distribution.', logo:STOCK_LOGOS.civicmesh },
  { id:'ledgerline', symbol:'PPSC', name:'Pepsicoa', sector:'CONSUMER', price:174.63, dividendYield:2.5, volatility:.03, description:'Food, beverage, and everyday consumer brands.', logo:STOCK_LOGOS.ledgerline },
  { id:'clearwater', symbol:'MCDL', name:"McDonel's", sector:'CONSUMER', price:289.14, dividendYield:2.1, volatility:.034, description:'Quick-service restaurants and franchise operations.', logo:STOCK_LOGOS.clearwater },
  { id:'redwoodbio', symbol:'ADZ', name:'Adidaz', sector:'CONSUMER', price:118.4, dividendYield:1.2, volatility:.038, description:'Performance apparel and sporting goods.', logo:STOCK_LOGOS.redwoodbio },
  { id:'novahealth', symbol:'NKR', name:'Nikora', sector:'CONSUMER', price:84.22, dividendYield:1.0, volatility:.042, description:'Consumer retail and lifestyle products.', logo:STOCK_LOGOS.novahealth },
  { id:'harborretail', symbol:'SNYA', name:'Sonya', sector:'ELECTRONICS', price:96.44, dividendYield:0.8, volatility:.018, description:'Entertainment hardware and imaging technology.', logo:STOCK_LOGOS.harborretail },
  { id:'marketnest', symbol:'ORCN', name:'Oraclen', sector:'SOFTWARE', price:214.72, dividendYield:1.4, volatility:.022, description:'Business databases and cloud software platforms.', logo:STOCK_LOGOS.marketnest },
  { id:'ironvale', symbol:'MVL', name:'MetaVerse Labs', sector:'SOCIAL_TECH', price:301.18, dividendYield:0, volatility:.026, description:'Social platforms and immersive digital communities.', logo:STOCK_LOGOS.ironvale },
  { id:'rallypoint', symbol:'PYLO', name:'PayPalio', sector:'FINTECH', price:73.35, dividendYield:0, volatility:.03, description:'Digital wallets and merchant payment rails.', logo:STOCK_LOGOS.rallypoint },
  { id:'skylattice', symbol:'MCRD', name:'MasterCardia', sector:'PAYMENTS', price:438.82, dividendYield:0.5, volatility:.034, description:'Global payment network and transaction services.', logo:STOCK_LOGOS.skylattice },
  { id:'orbitalis', symbol:'VSNA', name:'VisaNova', sector:'PAYMENTS', price:351.77, dividendYield:0.7, volatility:.038, description:'Card network and digital commerce infrastructure.', logo:STOCK_LOGOS.orbitalis },
  { id:'signalhouse', symbol:'JPMX', name:'JPMorganix', sector:'BANKING', price:188.91, dividendYield:2.2, volatility:.042, description:'Commercial banking and capital markets.', logo:STOCK_LOGOS.signalhouse },
  { id:'framefoundry', symbol:'GLMX', name:'Goldmanex', sector:'FINANCE', price:512.48, dividendYield:1.7, volatility:.018, description:'Investment banking and institutional finance.', logo:STOCK_LOGOS.framefoundry },
  { id:'terrafolio', symbol:'MDRX', name:'ModernaX', sector:'PHARMA', price:132.74, dividendYield:0, volatility:.022, description:'Biotechnology and next-generation medicines.', logo:STOCK_LOGOS.terrafolio },
  { id:'bricklane', symbol:'PFZA', name:'Pfizera', sector:'PHARMA', price:42.18, dividendYield:4.1, volatility:.026, description:'Medicines and global healthcare research.', logo:STOCK_LOGOS.bricklane },
  { id:'morrowfoods', symbol:'SPYD', name:'SpaceYard', sector:'AEROSPACE', price:86.72, dividendYield:0, volatility:.03, description:'Launch systems and commercial space infrastructure.', logo:STOCK_LOGOS.morrowfoods },
  { id:'kineticwear', symbol:'RKTX', name:'RocketX', sector:'AEROSPACE', price:247.19, dividendYield:0, volatility:.034, description:'Propulsion and orbital logistics technology.', logo:STOCK_LOGOS.kineticwear },
  { id:'blueharvest', symbol:'WMTX', name:'Walmartia', sector:'RETAIL', price:69.84, dividendYield:1.4, volatility:.038, description:'Large-scale retail and fulfillment networks.', logo:STOCK_LOGOS.blueharvest },
  { id:'atlasbrands', symbol:'STBX', name:'Starbuxx', sector:'CONSUMER', price:94.51, dividendYield:1.9, volatility:.042, description:'Coffee retail and high-frequency customer experiences.', logo:STOCK_LOGOS.atlasbrands },
  { id:'coastline', symbol:'UBRX', name:'Uberix', sector:'MOBILITY', price:78.45, dividendYield:0, volatility:.018, description:'On-demand mobility and delivery marketplaces.', logo:STOCK_LOGOS.coastline },
  { id:'meridianworks', symbol:'ABBX', name:'AirBnbia', sector:'TRAVEL', price:164.35, dividendYield:0, volatility:.022, description:'Travel stays and experience marketplaces.', logo:STOCK_LOGOS.meridianworks },
  { id:'adobeon', symbol:'ADBN', name:'Adobeon', sector:'SOFTWARE', price:534.61, dividendYield:0.4, volatility:.026, description:'Creative tools and digital document workflows.', logo:require('../../assets/round25/stock-adobeon.webp') },
];

export const LEGACY_STOCK_NAME_MIGRATIONS: Record<string, string> = {
  'BrightGrid Energy':'Amazone','Surya Energy':'Amazone','Vahana Motors':'Teslah','Bharat Bank':'Netfliks','ArcLight Systems':'MicroSift','Northstar Pharma':'Teslah','Beacon Bank':'Netfliks'
};
