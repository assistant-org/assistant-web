import { Budget, BudgetFlavorLine } from "../types";

const PILSEN_PRICE = 14.5;
const OTHER_PRICE = 15.9;

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function isPilsen(name: string): boolean {
  return /pilsen/i.test(name);
}

export function recalculateAutoServicoContract(budget: Budget): {
  flavors: BudgetFlavorLine[];
  finalTotal: number;
} {
  const calc = budget.calculation;
  const baseFlavors = calc.flavorLines || budget.flavors || [];

  const flavors: BudgetFlavorLine[] = baseFlavors.map((f) => {
    const unitPrice = isPilsen(f.name) ? PILSEN_PRICE : OTHER_PRICE;
    return {
      ...f,
      unitPrice,
      subtotal: roundMoney(f.liters * unitPrice),
    };
  });

  const flavorsSubtotal = roundMoney(
    flavors.reduce((sum, line) => sum + line.subtotal, 0),
  );
  const distanceCost = calc.distanceCost ?? 0;
  const extrasSubtotal = calc.extrasSubtotal ?? 0;
  const finalTotal = roundMoney(flavorsSubtotal + distanceCost + extrasSubtotal);

  return { flavors, finalTotal };
}
