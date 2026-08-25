import { Budget } from "../../../shared/services/budgets/types";
import { BudgetFormValues } from "../../../shared/services/budgets/schema";

/** Auto-added in calculation — never user-selected in the form. */
const AUTO_EXTRA_IDS = new Set(["disposable_cups"]);

export function budgetToFormValues(budget: Budget): BudgetFormValues {
  return {
    serviceType: budget.serviceType,
    people: budget.people,
    hours: budget.hours,
    consumptionProfile: budget.consumptionProfile,
    otherDrinks: budget.otherDrinks,
    distanceKm: budget.distanceKm,
    flavors: (budget.flavors || []).map((f) => ({
      productId: f.productId,
      name: f.name,
      unitPrice: f.unitPrice,
      percent: f.percent ?? 0,
    })),
    extras: (budget.extras || [])
      .filter((e) => !AUTO_EXTRA_IDS.has(e.extraId))
      .map((e) => ({ extraId: e.extraId })),
    correctedLiters: budget.calculation?.wasLitersAdjusted
      ? budget.calculation.correctedLiters
      : null,
    clientName: budget.clientName,
    clientPhone: budget.clientPhone,
    eventDate: budget.eventDate || "",
    notes: budget.notes || "",
    negotiatedTotal: budget.calculation?.wasAdjusted
      ? budget.finalTotal
      : null,
    adjustmentReason: budget.adjustmentReason,
  };
}
