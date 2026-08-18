import { z } from "zod";
import { requiredSelectString } from "../../utils/zodHelpers";
import { PaymentMethod, TransactionType } from "./types";

const emptyToNull = (val: unknown) =>
  val === "" || val === undefined ? null : val;

/**
 * Single validation schema for Receita/Despesa only.
 * Transfer was removed from the operational model.
 *
 * paymentMethod: required for EXPENSE, optional for INCOME.
 */
export const transactionSchema = z
  .object({
    type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
    date: z.string().min(1, "Data de transação é obrigatória"),
    value: z
      .number({ error: "Valor é obrigatório" })
      .min(0.01, "Valor deve ser maior que zero"),
    description: z.string().optional(),
    paymentMethod: z.preprocess(
      emptyToNull,
      z.nativeEnum(PaymentMethod).nullable().optional(),
    ),
    eventId: z.preprocess(emptyToNull, z.string().nullable().optional()),
    categoryId: requiredSelectString("Categoria é obrigatória"),
    destinationAccountId: z.preprocess(
      emptyToNull,
      z.string().nullable().optional(),
    ),
    sourceAccountId: z.preprocess(
      emptyToNull,
      z.string().nullable().optional(),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.type === TransactionType.EXPENSE && !data.paymentMethod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Forma de pagamento é obrigatória",
        path: ["paymentMethod"],
      });
    }
  });

export type TransactionFormSchema = z.infer<typeof transactionSchema>;

export const incomeExpenseSchema = transactionSchema;
