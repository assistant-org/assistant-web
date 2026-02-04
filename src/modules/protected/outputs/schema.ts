import { z } from 'zod';
import { OutputType, PaymentMethod } from './types';

export const outputFormSchema = z.object({
  value: z.number({ required_error: 'Valor é obrigatório' }).min(0.01, 'Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  paymentMethod: z.nativeEnum(PaymentMethod, { required_error: 'Forma de pagamento é obrigatória' }),
  description: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceDay: z.number().optional(),
}).superRefine((data, ctx) => {
  data.type = data.isRecurring ? OutputType.FIXED : OutputType.VARIABLE;

  if (data.isRecurring && (data.recurrenceDay === undefined || data.recurrenceDay < 1 || data.recurrenceDay > 31)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Dia da recorrência (1-31) é obrigatório para despesas fixas.',
      path: ['recurrenceDay'],
    });
  }
});


export type OutputFormSchema = z.infer<typeof outputFormSchema> & { type: OutputType };
