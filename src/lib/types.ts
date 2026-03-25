export type ClothingCategory =
  | "tops"
  | "bottoms"
  | "outerwear"
  | "dresses"
  | "shoes"
  | "bags"
  | "accessories"
  | "other";

export const CATEGORIES: { value: ClothingCategory; label: string }[] = [
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "outerwear", label: "Outerwear" },
  { value: "dresses", label: "Dresses" },
  { value: "shoes", label: "Shoes" },
  { value: "bags", label: "Bags" },
  { value: "accessories", label: "Accessories" },
  { value: "other", label: "Other" },
];

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  brand: string | null;
  color: string | null;
  image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClothingItemWithCount extends ClothingItem {
  wear_count: number;
}

export interface Outfit {
  id: string;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface OutfitItem {
  id: string;
  outfit_id: string;
  clothes_id: string;
}

export interface OutfitWithItems extends Outfit {
  items: ClothingItem[];
}
