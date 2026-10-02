export type CollectionCategory = 'CARS' | 'YACHTS' | 'JETS' | 'PROPERTIES';

export interface CollectionItem {
  id: string;
  name: string;
  type: string;
  price: number;
  upkeep: number;
  prestige: number;
  image?: number;
  category: CollectionCategory;
}
