export type BudgetServiceType = "TOTEM" | "KOMBI";

export type ConsumptionProfileId = "CASUAL" | "MODERATE" | "HIGH";

export interface BudgetFlavorInput {
  productId: string;
  name: string;
  unitPrice: number;
  /** Share of required liters (0–100). */
  percent: number;
}

export interface BudgetExtraSelection {
  extraId: string;
}

export interface BudgetCalculateInput {
  serviceType: BudgetServiceType;
  people: number;
  hours: number;
  consumptionProfile: ConsumptionProfileId;
  otherDrinks: boolean;
  distanceKm: number;
  flavors: BudgetFlavorInput[];
  extras: BudgetExtraSelection[];
  /** Manual total liters (review). Null = bill on suppliedLiters. */
  correctedLiters?: number | null;
  negotiatedTotal?: number | null;
  adjustmentReason?: string | null;
}

export interface BudgetFlavorLine {
  productId: string;
  name: string;
  liters: number;
  unitPrice: number;
  subtotal: number;
  percent: number;
}

export interface BudgetExtraLine {
  extraId: string;
  label: string;
  amount: number;
}

export interface BudgetOperationalCost {
  label: string;
  amount: number;
  waived: boolean;
  detail: string;
}

export interface BudgetKegLine {
  size: number;
  count: number;
}

export interface BudgetCalculationResult {
  people: number;
  hours: number;
  litersPerPersonPerHour: number;
  otherDrinksFactor: number;
  /** @deprecated Prefer requiredLiters — kept for older snapshots. */
  totalLiters: number;
  requiredLiters: number;
  suppliedLiters: number;
  technicalReserve: number;
  kegPlan: BudgetKegLine[];
  flavorLines: BudgetFlavorLine[];
  flavorsSubtotal: number;
  distanceKm: number;
  distanceRate: number;
  distanceCost: number;
  operational: BudgetOperationalCost;
  extraLines: BudgetExtraLine[];
  extrasSubtotal: number;
  calculatedTotal: number;
  finalTotal: number;
  adjustmentReason: string | null;
  wasAdjusted: boolean;
  /** Manual total liters when set; otherwise null. */
  correctedLiters: number | null;
  wasLitersAdjusted: boolean;
}

export interface BudgetClientInfo {
  name: string;
  phone: string;
  city: string;
  notes: string;
}

export interface Budget {
  id: string;
  serviceType: BudgetServiceType;
  people: number;
  hours: number;
  consumptionProfile: ConsumptionProfileId;
  otherDrinks: boolean;
  distanceKm: number;
  flavors: BudgetFlavorLine[];
  extras: BudgetExtraLine[];
  calculation: BudgetCalculationResult;
  calculatedTotal: number;
  finalTotal: number;
  adjustmentReason: string | null;
  clientName: string;
  clientPhone: string;
  clientCity: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBudgetRequest {
  serviceType: BudgetServiceType;
  people: number;
  hours: number;
  consumptionProfile: ConsumptionProfileId;
  otherDrinks: boolean;
  distanceKm: number;
  flavors: BudgetFlavorLine[];
  extras: BudgetExtraLine[];
  calculation: BudgetCalculationResult;
  calculatedTotal: number;
  finalTotal: number;
  adjustmentReason?: string | null;
  clientName: string;
  clientPhone: string;
  clientCity: string;
  notes?: string;
}
