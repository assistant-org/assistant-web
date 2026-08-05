export enum ProductCategory {
  BEVERAGE = "BEVERAGE",
  SUPPLY = "SUPPLY",
  EQUIPMENT = "EQUIPMENT",
}

export enum UnitOfMeasure {
  LITER = "LITER",
  UNIT = "UNIT",
  KG = "KG",
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  unit: UnitOfMeasure;
  trackStock: boolean;
  minStock: number | null;
  /** Default price per liter (R$/L). */
  defaultUnitValue: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductRequest {
  name: string;
  /** Ignored — service always persists BEVERAGE. */
  category?: ProductCategory;
  /** Ignored — service always persists LITER. */
  unit?: UnitOfMeasure;
  trackStock?: boolean;
  minStock?: number | null;
  defaultUnitValue?: number;
  active?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  category?: ProductCategory;
  unit?: UnitOfMeasure;
  trackStock?: boolean;
  minStock?: number | null;
  defaultUnitValue?: number;
  active?: boolean;
}
