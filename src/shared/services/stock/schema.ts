import { z } from "zod";
import { requiredSelectString } from "../../utils/zodHelpers";
import { StockMovementDirection, StockMovementType } from "./types";

const emptyToNull = (val: unknown) =>
  val === "" || val === undefined ? null : val;

export const stockLineItemSchema = z.object({
  productId: requiredSelectString("Produto é obrigatório"),
  batchId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  quantity: z
    .number({ error: "Quantidade é obrigatória" })
    .min(0.01, "Quantidade deve ser maior que zero"),
  /** Snapshot from selected batch — used to validate EXIT qty client-side. */
  availableQuantity: z.number().optional().nullable(),
  unitValue: z
    .number({ error: "Valor unitário é obrigatório" })
    .min(0, "Valor unitário não pode ser negativo")
    .optional()
    .nullable(),
});

export type StockLineItem = z.infer<typeof stockLineItemSchema>;

export function movementRequiresEvent(type: StockMovementType): boolean {
  return (
    type === StockMovementType.ENTRY || type === StockMovementType.EXIT
  );
}

export function movementRequiresJustification(type: StockMovementType): boolean {
  return (
    type === StockMovementType.LOSS ||
    type === StockMovementType.INTERNAL_CONSUMPTION
  );
}

const baseFields = {
  mode: z.enum(["individual", "lote"]).default("individual"),
  eventId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  items: z.array(stockLineItemSchema).min(1, "Adicione pelo menos um item"),
  reason: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
  direction: z.nativeEnum(StockMovementDirection).optional().nullable(),
};

export const entryMovementSchema = z
  .object({
    type: z.literal(StockMovementType.ENTRY),
    entryDate: z.string().min(1, "Data de entrada é obrigatória"),
    expiryDate: z.preprocess(emptyToNull, z.string().nullable().optional()),
    date: z.string().optional().nullable(),
    ...baseFields,
  })
  .superRefine((data, ctx) => {
    if (!data.eventId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Evento é obrigatório",
        path: ["eventId"],
      });
    }
  });

export const outgoingMovementSchema = z
  .object({
    type: z.enum([
      StockMovementType.EXIT,
      StockMovementType.LOSS,
      StockMovementType.INTERNAL_CONSUMPTION,
    ]),
    date: z.string().min(1, "Data é obrigatória"),
    entryDate: z.string().optional().nullable(),
    expiryDate: z.string().optional().nullable(),
    ...baseFields,
  })
  .superRefine((data, ctx) => {
    if (data.type === StockMovementType.EXIT && !data.eventId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Evento é obrigatório",
        path: ["eventId"],
      });
    }

    if (movementRequiresJustification(data.type)) {
      const justification = data.reason?.trim() ?? "";
      if (!justification) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Justificativa é obrigatória",
          path: ["reason"],
        });
      }
    }

    const batchIds = new Set<string>();
    data.items.forEach((item, i) => {
      if (!item.batchId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Lote é obrigatório",
          path: ["items", i, "batchId"],
        });
      } else if (batchIds.has(item.batchId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Lote duplicado na mesma operação",
          path: ["items", i, "batchId"],
        });
      } else {
        batchIds.add(item.batchId);
      }

      if (
        item.availableQuantity != null &&
        Number.isFinite(item.availableQuantity) &&
        item.quantity > item.availableQuantity
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Quantidade excede o disponível (${item.availableQuantity.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} L)`,
          path: ["items", i, "quantity"],
        });
      }
    });
  });

export const adjustmentMovementSchema = z
  .object({
    type: z.literal(StockMovementType.ADJUSTMENT),
    date: z.string().min(1, "Data é obrigatória"),
    entryDate: z.string().optional().nullable(),
    expiryDate: z.string().optional().nullable(),
    direction: z.nativeEnum(StockMovementDirection, {
      error: "Direção do ajuste é obrigatória",
    }),
    ...baseFields,
  })
  .superRefine((data, ctx) => {
    if (!data.eventId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Evento é obrigatório",
        path: ["eventId"],
      });
    }
  });

export const stockMovementSchema = z.discriminatedUnion("type", [
  entryMovementSchema,
  outgoingMovementSchema,
  adjustmentMovementSchema,
]);

export type StockMovementFormSchema = z.infer<typeof stockMovementSchema>;

/** Flat shape for React Hook Form. */
export interface StockMovementFormValues {
  type: StockMovementType;
  mode: "individual" | "lote";
  eventId?: string | null;
  items: StockLineItem[];
  date?: string;
  reason?: string | null;
  unitValue?: number | null;
  entryDate?: string | null;
  expiryDate?: string | null;
  observations?: string | null;
  direction?: StockMovementDirection | null;
  /** Legacy single-line fields kept optional for gradual migration in steps */
  productId?: string;
  batchId?: string | null;
  quantity?: number;
}
