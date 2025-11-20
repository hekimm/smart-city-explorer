import { Category } from '@/types';

export const CATEGORIES: Category[] = [
  {
    id: 'restaurant',
    name: 'Restoran',
    icon: 'restaurant',
    color: '#EF4444',
    osmTag: 'restaurant',
  },
  {
    id: 'cafe',
    name: 'Kafe',
    icon: 'cafe',
    color: '#F59E0B',
    osmTag: 'cafe',
  },
  {
    id: 'atm',
    name: 'ATM',
    icon: 'cash',
    color: '#10B981',
    osmTag: 'atm',
  },
  {
    id: 'pharmacy',
    name: 'Eczane',
    icon: 'medkit',
    color: '#06B6D4',
    osmTag: 'pharmacy',
  },
  {
    id: 'hospital',
    name: 'Hastane',
    icon: 'medical',
    color: '#DC2626',
    osmTag: 'hospital',
  },
  {
    id: 'market',
    name: 'Market',
    icon: 'cart',
    color: '#8B5CF6',
    osmTag: 'supermarket',
  },
  {
    id: 'fuel',
    name: 'Benzin',
    icon: 'water',
    color: '#F97316',
    osmTag: 'fuel',
  },
  {
    id: 'bank',
    name: 'Banka',
    icon: 'business',
    color: '#3B82F6',
    osmTag: 'bank',
  },
  {
    id: 'parking',
    name: 'Otopark',
    icon: 'car',
    color: '#6366F1',
    osmTag: 'parking',
  },
  {
    id: 'bus_station',
    name: 'Durak',
    icon: 'bus',
    color: '#14B8A6',
    osmTag: 'bus_station',
  },
  {
    id: 'tourist',
    name: 'Turistik',
    icon: 'camera',
    color: '#EC4899',
    osmTag: 'attraction',
  },
  {
    id: 'library',
    name: 'Kütüphane',
    icon: 'library',
    color: '#A855F7',
    osmTag: 'library',
  },
];

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find((cat) => cat.id === id);
};

export const getCategoryColor = (id: string): string => {
  return getCategoryById(id)?.color || '#6B7280';
};

export const getCategoryIcon = (id: string): string => {
  return getCategoryById(id)?.icon || 'location';
};
