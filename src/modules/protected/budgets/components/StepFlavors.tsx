import React from "react";
import {
  getFlavorUnitPrice,
  MAX_FLAVORS,
} from "../../../../shared/services/budgets/budget.config";
import { beerDistribution } from "../../../../shared/services/budgets/BeerDistributionService";
import { formatCurrency } from "../../../../shared/services/budgets/format";
import { BudgetFormValues } from "../../../../shared/services/budgets/schema";
import { BudgetServiceType } from "../../../../shared/services/budgets/types";
import { Product } from "../../../../shared/services/products/types";

interface StepFlavorsProps {
  products: Product[];
  serviceType: BudgetServiceType;
  value: BudgetFormValues["flavors"];
  onChange: (flavors: BudgetFormValues["flavors"]) => void;
  disabled?: boolean;
  error?: string;
}

function withEqualPercents(
  items: Array<{ productId: string; name: string; unitPrice: number }>,
): BudgetFormValues["flavors"] {
  const percents = beerDistribution.equalPercents(items.length);
  return items.map((item, i) => ({ ...item, percent: percents[i] ?? 0 }));
}

export default function StepFlavors({
  products,
  serviceType,
  value,
  onChange,
  disabled,
  error,
}: StepFlavorsProps) {
  const selectedIds = new Set(value.map((f) => f.productId));
  const atLimit = value.length >= MAX_FLAVORS;

  const toggle = (product: Product) => {
    const unitPrice = getFlavorUnitPrice(
      serviceType,
      product.name,
      product.defaultUnitValue,
    );

    if (selectedIds.has(product.id)) {
      onChange(
        withEqualPercents(
          value
            .filter((f) => f.productId !== product.id)
            .map(({ productId, name, unitPrice: price }) => ({
              productId,
              name,
              unitPrice: price,
            })),
        ),
      );
      return;
    }
    if (value.length >= MAX_FLAVORS) return;

    onChange(
      withEqualPercents([
        ...value.map(({ productId, name, unitPrice: price }) => ({
          productId,
          name,
          unitPrice: price,
        })),
        {
          productId: product.id,
          name: product.name,
          unitPrice,
        },
      ]),
    );
  };

  if (!products.length) {
    return (
      <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 rounded-xl p-4">
        Nenhum produto ativo encontrado. Cadastre sabores em Produtos para
        continuar.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Selecione até {MAX_FLAVORS} sabores. Com mais de um, você define a
        distribuição no próximo passo.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {products.map((product) => {
          const selected = selectedIds.has(product.id);
          const blocked = atLimit && !selected;
          const displayPrice = getFlavorUnitPrice(
            serviceType,
            product.name,
            product.defaultUnitValue,
          );
          return (
            <button
              key={product.id}
              type="button"
              disabled={disabled || blocked}
              onClick={() => toggle(product)}
              className={`text-left rounded-xl border-2 px-4 py-3 transition-all ${
                selected
                  ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40"
                  : blocked
                    ? "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 opacity-50 cursor-not-allowed"
                    : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 bg-white dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {selected ? "✓ " : ""}
                  {product.name}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatCurrency(displayPrice)}/L
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
