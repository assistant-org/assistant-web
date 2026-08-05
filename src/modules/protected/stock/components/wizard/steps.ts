import { StockMovementType } from "../../../../../shared/services/stock/types";
import { StockFormValues } from "../../schema";

export type StockStepKey =
  | "type"
  | "operation"
  | "meta"
  | "review";

export interface StockStepDefinition {
  key: StockStepKey;
  title: string;
  fields: (keyof StockFormValues)[];
}

const TYPE_STEP: StockStepDefinition = {
  key: "type",
  title: "Tipo",
  fields: ["type"],
};

const OPERATION_STEP: StockStepDefinition = {
  key: "operation",
  title: "Itens",
  fields: ["eventId", "mode", "items"],
};

const META_STEP_ENTRY: StockStepDefinition = {
  key: "meta",
  title: "Datas e descrição",
  fields: ["entryDate", "expiryDate", "observations"],
};

const META_STEP_OUT: StockStepDefinition = {
  key: "meta",
  title: "Data e descrição",
  fields: ["date", "reason"],
};

export const STOCK_REVIEW_STEP: StockStepDefinition = {
  key: "review",
  title: "Resumo",
  fields: [],
};

export function getStockStepsForType(type: StockMovementType): StockStepDefinition[] {
  if (type === StockMovementType.ENTRY) {
    return [TYPE_STEP, OPERATION_STEP, META_STEP_ENTRY, STOCK_REVIEW_STEP];
  }
  return [TYPE_STEP, OPERATION_STEP, META_STEP_OUT, STOCK_REVIEW_STEP];
}

export function requiresEvent(_type?: StockMovementType): boolean {
  return true;
}
