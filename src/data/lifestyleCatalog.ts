export type LifestyleCategory = 'SUPERCARS' | 'PRIVATE AVIATION' | 'YACHTS & MARINE' | 'PENTHOUSES';

export type LifestyleAsset = {
  id: string;
  category: LifestyleCategory;
  name: string;
  image: string;
  price: number;
  upkeep: number;
  prestige: number;
};

export const LIFESTYLE_CATALOG: LifestyleAsset[] = [
  { id: 'sports', category: 'SUPERCARS', name: 'Sports Coupe', image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=500&q=80', price: 85000, upkeep: 850, prestige: 12 },
  { id: 'italian', category: 'SUPERCARS', name: 'Italian Supercar', image: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=500&q=80', price: 320000, upkeep: 2200, prestige: 25 },
  { id: 'sedan', category: 'SUPERCARS', name: 'Luxury Sedan', image: 'https://images.unsplash.com/photo-1555353540-64580b51c258?w=500&q=80', price: 125000, upkeep: 1100, prestige: 16 },
  { id: 'jet', category: 'PRIVATE AVIATION', name: 'Private Jet', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&q=80', price: 4500000, upkeep: 42000, prestige: 80 },
  { id: 'yacht', category: 'YACHTS & MARINE', name: 'Luxury Superyacht', image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=500&q=80', price: 12000000, upkeep: 125000, prestige: 48 },
  { id: 'villa', category: 'PENTHOUSES', name: 'Modern Beverly Villa', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&q=80', price: 2500000, upkeep: 18000, prestige: 34 },
  { id: 'sky', category: 'PENTHOUSES', name: 'Penthouse Sky Suite', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&q=80', price: 8900000, upkeep: 52000, prestige: 44 },
  { id: 'office', category: 'PENTHOUSES', name: 'Commercial Office Tower', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&q=80', price: 12000000, upkeep: 70000, prestige: 38 },
];
