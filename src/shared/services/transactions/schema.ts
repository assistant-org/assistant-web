import { z } from "zod";
import { PaymentMethod, TransactionType } from "./types";

/**
 * Single validation schema for Receita/Despesa only.
 * Transfer was removed from the operational model.
 */
export const transactionSchema = z.object({
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
  date: z.string().min(1, "Data é obrigatória"),
  value: z
    .number({ error: "Valor é obrigatório" })
    .min(0.01, "Valor deve ser maior que zero"),
  description: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional().nullable(),
  eventId: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  destinationAccountId: z.string().optional().nullable(),
  sourceAccountId: z.string().optional().nullable(),
  /** Populated only for Despesa "Compra de Chopp" stock-entry step. */
  stockProductId: z.string().optional().nullable(),
  stockQuantityLiters: z.number().optional().nullable(),
  stockUnitValue: z.number().optional().nullable(),
  stockExpiryDate: z.string().optional().nullable(),
});

export type TransactionFormSchema = z.infer<typeof transactionSchema>;

export const incomeExpenseSchema = transactionSchema;
