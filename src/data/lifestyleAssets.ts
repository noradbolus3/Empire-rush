import { LifestyleItem } from '../types/game';
export const LIFESTYLE_REGISTRY: LifestyleItem[] = [
  { id: 'car_rolls', name: 'Phantom VIII', brand: 'Rolls-Royce', category: 'Hypercar', price: 460000, monthlyUpkeep: 3500, prestigePoints: 50, imageUrl: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=800&q=80', isOwned: false },
  { id: 'car_lambo', name: 'Revuelto V12', brand: 'Lamborghini', category: 'Hypercar', price: 608000, monthlyUpkeep: 4200, prestigePoints: 65, imageUrl: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=800&q=80', isOwned: false },
  { id: 'car_ferrari', name: 'SF90 Stradale', brand: 'Ferrari', category: 'Hypercar', price: 520000, monthlyUpkeep: 3900, prestigePoints: 60, imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80', isOwned: false },
  { id: 'jet_g700', name: 'G700 Flagship', brand: 'Gulfstream', category: 'Aviation', price: 78000000, monthlyUpkeep: 120000, prestigePoints: 400, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', isOwned: false },
  { id: 'yacht_flyingfox', name: 'Flying Fox Megayacht', brand: 'Lürssen', category: 'Yacht', price: 400000000, monthlyUpkeep: 850000, prestigePoints: 1200, imageUrl: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80', isOwned: false },
  { id: 'pres_the_beast', name: 'The Beast (Cadillac One)', brand: 'United States Secret Service', category: 'State_Asset', price: 0, monthlyUpkeep: 0, prestigePoints: 2500, imageUrl: 'https://images.unsplash.com/photo-1555353540-64580b51c258?w=800&q=80', isOwned: false, requiresOffice: 'President_USA' },
  { id: 'pres_airforce1', name: 'Air Force One (VC-25B)', brand: 'US Air Force', category: 'State_Asset', price: 0, monthlyUpkeep: 0, prestigePoints: 5000, imageUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e6f9?w=800&q=80', isOwned: false, requiresOffice: 'President_USA' },
];
