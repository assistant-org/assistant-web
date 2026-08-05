import { TransactionType } from "../../../../../shared/services/transactions/types";
import { TransactionFormValues } from "../../types";

export type StepKey =
  | "type"
  | "incomeExpenseDetails"
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

export function getStepsForType(_type: TransactionType): StepDefinition[] {
  return [TYPE_STEP, INCOME_EXPENSE_DETAILS, INCOME_EXPENSE_EXTRAS, REVIEW_STEP];
}
