import { UseFormReturn } from "react-hook-form";
import { Budget } from "../../../shared/services/budgets/types";
import { BudgetCalculationResult } from "../../../shared/services/budgets/types";
import { BudgetFormValues } from "../../../shared/services/budgets/schema";
import { Product } from "../../../shared/services/products/types";

export interface IBudgetsPresentationProps {
  mode: "list" | "create" | "done";
  budgets: Budget[];
  products: Product[];
  formMethods: UseFormReturn<BudgetFormValues>;
  calculation: BudgetCalculationResult | null;
  lastSaved: Budget | null;
  isLoading: boolean;
  isSaving: boolean;
  onStartCreate: () => void;
  onCancelCreate: () => void;
  onFinalize: () => void;
  onBackToList: () => void;
  onDelete: (budget: Budget) => void;
}
