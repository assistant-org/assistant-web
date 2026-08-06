import { Budget } from "../../../shared/services/budgets/types";
import { BudgetFormValues } from "../../../shared/services/budgets/schema";

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
    extras: (budget.extras || []).map((e) => ({ extraId: e.extraId })),
    correctedLiters: budget.calculation?.wasLitersAdjusted
      ? budget.calculation.correctedLiters
      : null,
    clientName: budget.clientName,
    clientPhone: budget.clientPhone,
    clientCity: budget.clientCity,
    eventDate: budget.eventDate || "",
    notes: budget.notes || "",
    negotiatedTotal: budget.calculation?.wasAdjusted
      ? budget.finalTotal
      : null,
    adjustmentReason: budget.adjustmentReason,
  };
}
