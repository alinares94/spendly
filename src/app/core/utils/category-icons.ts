import {
  LucideIconData,
  House, Utensils, Car, Pill, ShoppingBag, Smartphone, Plane,
  Gamepad2, Banknote, Briefcase, GraduationCap, Zap, Droplets,
  PawPrint, Music, Shirt, Coffee, Dumbbell, Baby, Gift, Wifi,
  Building2, Heart, Star, ShoppingCart, Fuel, Book, TrainFront,
  Bike, Bus,
} from 'lucide-angular';

export interface CategoryIconDef {
  name: string;
  icon: LucideIconData;
}

export const CATEGORY_ICONS: CategoryIconDef[] = [
  { name: 'House', icon: House },
  { name: 'Utensils', icon: Utensils },
  { name: 'Car', icon: Car },
  { name: 'Pill', icon: Pill },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Plane', icon: Plane },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Banknote', icon: Banknote },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Zap', icon: Zap },
  { name: 'Droplets', icon: Droplets },
  { name: 'PawPrint', icon: PawPrint },
  { name: 'Music', icon: Music },
  { name: 'Shirt', icon: Shirt },
  { name: 'Coffee', icon: Coffee },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Baby', icon: Baby },
  { name: 'Gift', icon: Gift },
  { name: 'Wifi', icon: Wifi },
  { name: 'Building2', icon: Building2 },
  { name: 'Heart', icon: Heart },
  { name: 'Star', icon: Star },
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'Fuel', icon: Fuel },
  { name: 'Book', icon: Book },
  { name: 'TrainFront', icon: TrainFront },
  { name: 'Bike', icon: Bike },
  { name: 'Bus', icon: Bus },
];

export const CATEGORY_ICON_MAP = new Map<string, LucideIconData>(
  CATEGORY_ICONS.map((i) => [i.name, i.icon])
);

export function getCategoryIcon(name: string | null | undefined): LucideIconData | null {
  if (!name) return null;
  return CATEGORY_ICON_MAP.get(name) ?? null;
}
