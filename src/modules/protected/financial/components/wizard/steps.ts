import { TransactionType } from "../../../../../shared/services/transactions/types";
import { TransactionFormValues } from "../../types";

export const COMPRA_DE_CHOPP_CATEGORY_NAME = "Compra de Chopp";
export const COMPRA_DE_CHOPP_CATEGORY_ID = "7";

export function isCompraDeChoppCategory(
  category?: { id?: string | null; name?: string | null } | null,
): boolean {
  if (!category) return false;
  return (
    String(category.id) === COMPRA_DE_CHOPP_CATEGORY_ID ||
    category.name === COMPRA_DE_CHOPP_CATEGORY_NAME
  );
}

export type StepKey =
  | "type"
  | "incomeExpenseDetails"
  | "stockEntry"
  | "incomeExpenseExtras"
  | "review";

export interface StepDefinition {
  key: StepKey;
  title: string;
  fields: (keyof TransactionFormValues)[];
}

const TYPE_STEP: StepDefinition = {
  key: "type",
  title: "Tipo",
  fields: ["type"],
};

const INCOME_EXPENSE_DETAILS: StepDefinition = {
  key: "incomeExpenseDetails",
  title: "Dados da movimentação",
  fields: ["date", "value", "categoryId"],
};

const STOCK_ENTRY_STEP: StepDefinition = {
  key: "stockEntry",
  title: "Entrada de estoque",
  fields: ["stockProductId", "stockQuantityLiters", "stockUnitValue", "stockExpiryDate"],
};

const INCOME_EXPENSE_EXTRAS: StepDefinition = {
  key: "incomeExpenseExtras",
  title: "Detalhes adicionais",
  fields: ["paymentMethod", "eventId", "description"],
};

export const REVIEW_STEP: StepDefinition = {
  key: "review",
  title: "Resumo",
  fields: [],
};

export function getStepsForType(
  type: TransactionType,
  options?: { includeStockEntry?: boolean },
): StepDefinition[] {
  const steps: StepDefinition[] = [TYPE_STEP, INCOME_EXPENSE_DETAILS];
  if (type === TransactionType.EXPENSE && options?.includeStockEntry) {
    steps.push(STOCK_ENTRY_STEP);
  }
  steps.push(INCOME_EXPENSE_EXTRAS, REVIEW_STEP);
  return steps;
}
