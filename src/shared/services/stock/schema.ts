import { z } from "zod";
import { StockMovementDirection, StockMovementType } from "./types";

export const entryMovementSchema = z.object({
  type: z.literal(StockMovementType.ENTRY),
  productId: z.string().min(1, "Produto é obrigatório"),
  quantity: z
    .number({ error: "Quantidade é obrigatória" })
    .min(0.01, "Quantidade deve ser maior que zero"),
  unitValue: z
    .number({ error: "Valor unitário é obrigatório" })
    .min(0, "Valor unitário não pode ser negativo"),
  entryDate: z.string().min(1, "Data de entrada é obrigatória"),
  expiryDate: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
  batchId: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  direction: z.nativeEnum(StockMovementDirection).optional().nullable(),
});

export const outgoingMovementSchema = z.object({
  type: z.enum([
    StockMovementType.EXIT,
    StockMovementType.LOSS,
    StockMovementType.INTERNAL_CONSUMPTION,
  ]),
  productId: z.string().min(1, "Produto é obrigatório"),
  batchId: z.string().min(1, "Lote é obrigatório"),
  quantity: z
    .number({ error: "Quantidade é obrigatória" })
    .min(0.01, "Quantidade deve ser maior que zero"),
  date: z.string().min(1, "Data é obrigatória"),
  reason: z.string().optional().nullable(),
  unitValue: z.number().optional().nullable(),
  entryDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
  direction: z.nativeEnum(StockMovementDirection).optional().nullable(),
});

export const adjustmentMovementSchema = z.object({
  type: z.literal(StockMovementType.ADJUSTMENT),
  productId: z.string().min(1, "Produto é obrigatório"),
  batchId: z.string().min(1, "Lote é obrigatório"),
  quantity: z
    .number({ error: "Quantidade é obrigatória" })
    .min(0.01, "Quantidade deve ser maior que zero"),
  date: z.string().min(1, "Data é obrigatória"),
  direction: z.nativeEnum(StockMovementDirection, {
    error: "Direção do ajuste é obrigatória",
  }),
  reason: z.string().optional().nullable(),
  unitValue: z.number().optional().nullable(),
  entryDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
});

/**
 * Single source of validation for stock movements. ENTRY creates a new batch;
 * other types require an existing batch.
 */
export const stockMovementSchema = z.discriminatedUnion("type", [
  entryMovementSchema,
  outgoingMovementSchema,
  adjustmentMovementSchema,
]);

export type StockMovementFormSchema = z.infer<typeof stockMovementSchema>;

/** Flat shape for React Hook Form (discriminated unions are awkward with RHF). */
export interface StockMovementFormValues {
  type: StockMovementType;
  productId: string;
  batchId?: string | null;
  quantity?: number;
  date?: string;
  reason?: string | null;
  unitValue?: number | null;
  entryDate?: string | null;
  expiryDate?: string | null;
  observations?: string | null;
  direction?: StockMovementDirection | null;
}
