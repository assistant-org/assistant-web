import { StockMovementType } from "../../../../../shared/services/stock/types";
import { StockFormValues } from "../../schema";

export type StockStepKey =
  | "type"
  | "entryDetails"
  | "entryMeta"
  | "outgoingDetails"
  | "outgoingMeta"
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

const ENTRY_DETAILS: StockStepDefinition = {
  key: "entryDetails",
  title: "Produto e quantidade",
  fields: ["productId", "quantity", "unitValue"],
};

const ENTRY_META: StockStepDefinition = {
  key: "entryMeta",
  title: "Datas e descrição",
  fields: ["entryDate", "expiryDate", "observations"],
};

const OUTGOING_DETAILS: StockStepDefinition = {
  key: "outgoingDetails",
  title: "Produto e lote",
  fields: ["productId", "batchId", "quantity"],
};

const OUTGOING_META: StockStepDefinition = {
  key: "outgoingMeta",
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
    return [TYPE_STEP, ENTRY_DETAILS, ENTRY_META, STOCK_REVIEW_STEP];
  }
  return [TYPE_STEP, OUTGOING_DETAILS, OUTGOING_META, STOCK_REVIEW_STEP];
}
