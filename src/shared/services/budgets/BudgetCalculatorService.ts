import {
  BUDGET_EXTRAS,
  OTHER_DRINKS_FACTOR,
  buildExtraCalcContext,
  getConsumptionProfile,
  getExtraDefinition,
  getServiceTypeConfig,
} from "./budget.config";
import { beerDistribution } from "./BeerDistributionService";
import {
  BudgetCalculateInput,
  BudgetCalculationResult,
  BudgetExtraLine,
  BudgetFlavorLine,
  BudgetOperationalCost,
} from "./types";

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundLiters(value: number): number {
  return Math.round(value * 100) / 100;
}

export class BudgetCalculatorService {
  calculate(input: BudgetCalculateInput): BudgetCalculationResult {
    const service = getServiceTypeConfig(input.serviceType);
    const profile = getConsumptionProfile(input.consumptionProfile);
    const otherDrinksFactor = input.otherDrinks ? OTHER_DRINKS_FACTOR : 1;

    const requiredLiters = roundLiters(
      input.people *
        input.hours *
        profile.litersPerPersonPerHour *
        otherDrinksFactor,
    );

    const flavorsWithPercent =
      input.flavors.length === 1
        ? input.flavors.map((f) => ({ ...f, percent: 100 }))
        : input.flavors;

    const kegPlanResult = beerDistribution.planKegs(requiredLiters);
    const suppliedLiters = kegPlanResult.suppliedLiters;

    const hasCorrected =
      input.correctedLiters != null &&
      Number.isFinite(input.correctedLiters) &&
      input.correctedLiters > 0;
    const correctedLiters = hasCorrected
      ? roundLiters(input.correctedLiters as number)
      : null;
    const wasLitersAdjusted = Boolean(correctedLiters);
    const billingLiters = correctedLiters ?? suppliedLiters;

    const allocations = beerDistribution.allocateFlavorLiters(
      billingLiters,
      flavorsWithPercent,
    );
    const flavorLines: BudgetFlavorLine[] = allocations.map((a) => ({
      productId: a.productId,
      name: a.name,
      liters: a.liters,
      unitPrice: a.unitPrice,
      percent: a.percent,
      subtotal: roundMoney(a.liters * a.unitPrice),
    }));

    const flavorsSubtotal = roundMoney(
      flavorLines.reduce((sum, line) => sum + line.subtotal, 0),
    );

    const distanceCost = roundMoney(
      input.distanceKm * service.distanceRatePerKm,
    );

    const selectedExtras = input.extras
      .map((e) => getExtraDefinition(e.extraId))
      .filter((e): e is NonNullable<typeof e> => Boolean(e));

    const waiveOperational = selectedExtras.some(
      (e) => e.flags?.waiveOperationalCost,
    );

    const operational = this.computeOperational(
      input,
      service,
      waiveOperational,
    );

    const extraCtx = buildExtraCalcContext(input, billingLiters);
    const extraLines: BudgetExtraLine[] = selectedExtras.map((def) => {
      const amount = roundMoney(def.calc(extraCtx));
      let label = def.label;
      if (def.id === "custom_mugs") {
        label = `${def.label} (${extraCtx.people} × R$ 3,00)`;
      } else if (def.id === "disposable_cups") {
        const cups = Math.ceil(billingLiters / 0.3);
        label = `Copos descartáveis de 300 ml (até ${cups} unidades para ${extraCtx.people} pessoas)`;
      } else if (def.id === "tasting") {
        label = "Degustação gratuita dos chopps selecionados";
      }
      return {
        extraId: def.id,
        label,
        amount,
      };
    });
    const extrasSubtotal = roundMoney(
      extraLines.reduce((sum, line) => sum + line.amount, 0),
    );

    const calculatedTotal = roundMoney(
      flavorsSubtotal +
        distanceCost +
        operational.amount +
        extrasSubtotal,
    );

    const hasNegotiation =
      input.negotiatedTotal != null &&
      Number.isFinite(input.negotiatedTotal) &&
      input.negotiatedTotal !== calculatedTotal;

    const finalTotal = hasNegotiation
      ? roundMoney(input.negotiatedTotal as number)
      : calculatedTotal;

    return {
      people: input.people,
      hours: input.hours,
      litersPerPersonPerHour: profile.litersPerPersonPerHour,
      otherDrinksFactor,
      totalLiters: requiredLiters,
      requiredLiters,
      suppliedLiters,
      technicalReserve: kegPlanResult.technicalReserve,
      kegPlan: kegPlanResult.kegs,
      flavorLines,
      flavorsSubtotal,
      distanceKm: input.distanceKm,
      distanceRate: service.distanceRatePerKm,
      distanceCost,
      operational,
      extraLines,
      extrasSubtotal,
      calculatedTotal,
      finalTotal,
      adjustmentReason: hasNegotiation
        ? input.adjustmentReason?.trim() || null
        : null,
      wasAdjusted: hasNegotiation,
      correctedLiters,
      wasLitersAdjusted,
    };
  }

  listExtraOptions() {
    return BUDGET_EXTRAS.map((e) => ({
      id: e.id,
      label: e.label,
      description: e.description,
    }));
  }

  private computeOperational(
    input: BudgetCalculateInput,
    service: ReturnType<typeof getServiceTypeConfig>,
    waived: boolean,
  ): BudgetOperationalCost {
    if (service.operational.mode === "fixed") {
      const amount = waived ? 0 : service.operational.amount;
      return {
        label: service.label,
        amount,
        waived,
        detail: waived
          ? "Custo operacional zerado (Parceria)"
          : `Fixo R$ ${service.operational.amount.toFixed(2)}`,
      };
    }

    const raw = input.hours * service.operational.amount;
    const amount = waived ? 0 : roundMoney(raw);
    return {
      label: service.label,
      amount,
      waived,
      detail: waived
        ? "Custo operacional zerado (Parceria)"
        : `${input.hours}h × R$ ${service.operational.amount.toFixed(2)}`,
    };
  }
}

export const budgetCalculator = new BudgetCalculatorService();
