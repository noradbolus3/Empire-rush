export type LifestyleCategory = 'SUPERCARS' | 'PRIVATE AVIATION' | 'YACHTS & MARINE' | 'PENTHOUSES';

export type LifestyleAsset = {
  id: string;
  category: LifestyleCategory;
  name: string;
  brand: string;
  image: number;
  price: number;
  upkeep: number;
  prestige: number;
};

export const LIFESTYLE_CATALOG: LifestyleAsset[] = [
  { id: 'car_valora', category: 'SUPERCARS', name: 'V8 Coupe', brand: 'Valora', image: require('../../assets/lifestyle/valora-v8-coupe.jpg'), price: 85000, upkeep: 850, prestige: 12 },
  { id: 'car_crestline', category: 'SUPERCARS', name: 'Executive Sedan', brand: 'Crestline', image: require('../../assets/lifestyle/crestline-executive-sedan.jpg'), price: 125000, upkeep: 1100, prestige: 16 },
  { id: 'car_aurelia', category: 'SUPERCARS', name: 'R9 Supercar', brand: 'Aurelia', image: require('../../assets/lifestyle/aurelia-r9-supercar.jpg'), price: 320000, upkeep: 2200, prestige: 25 },
  { id: 'jet_altair', category: 'PRIVATE AVIATION', name: 'Light Jet', brand: 'Altair Aviation', image: require('../../assets/lifestyle/altair-light-jet.jpg'), price: 1800000, upkeep: 18000, prestige: 50 },
  { id: 'jet_northstar', category: 'PRIVATE AVIATION', name: 'Executive Jet', brand: 'Northstar Aviation', image: require('../../assets/lifestyle/northstar-executive-jet.jpg'), price: 4500000, upkeep: 42000, prestige: 80 },
  { id: 'yacht_harborline', category: 'YACHTS & MARINE', name: 'Coastal Yacht', brand: 'Harborline Marine', image: require('../../assets/lifestyle/harborline-yacht.jpg'), price: 3500000, upkeep: 38000, prestige: 42 },
  { id: 'yacht_bluehaven', category: 'YACHTS & MARINE', name: 'Superyacht', brand: 'Bluehaven Marine', image: require('../../assets/lifestyle/bluehaven-superyacht.jpg'), price: 12000000, upkeep: 125000, prestige: 95 },
  { id: 'villa_cypress', category: 'PENTHOUSES', name: 'Glass Villa', brand: 'Cypress Estates', image: require('../../assets/lifestyle/cypress-glass-villa.jpg'), price: 2500000, upkeep: 18000, prestige: 34 },
  { id: 'penthouse_meridian', category: 'PENTHOUSES', name: 'Sky Penthouse', brand: 'Meridian Estates', image: require('../../assets/lifestyle/meridian-sky-penthouse.jpg'), price: 8900000, upkeep: 52000, prestige: 44 },
  { id: 'tower_summit', category: 'PENTHOUSES', name: 'District Tower', brand: 'Summit Properties', image: require('../../assets/lifestyle/summit-district-tower.jpg'), price: 12000000, upkeep: 70000, prestige: 62 },
];
