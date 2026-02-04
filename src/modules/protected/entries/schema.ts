import { z } from 'zod';
import { EventType, PaymentMethod } from './types';

const beerControlSchema = z.object({
  stockItemId: z.string().min(1, 'Tipo de chopp é obrigatório'),
  quantityTaken: z.number().min(0, 'Deve ser um número positivo'),
  quantityReturned: z.number().min(0, 'Deve ser um número positivo'),
});

export const entryFormSchema = z.object({
  value: z.number({ required_error: 'Valor é obrigatório' }).min(0.01, 'Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  event: z.string().optional(),
  eventType: z.nativeEnum(EventType, { required_error: 'Tipo de evento é obrigatório' }),
  description: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  beerControl: z.array(beerControlSchema).optional(),
}).superRefine((data, ctx) => {
  // Rule: Payment method is required for "Evento Fechado"
  if (data.eventType === EventType.CLOSED && !data.paymentMethod) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Forma de pagamento é obrigatória para eventos fechados.',
      path: ['paymentMethod'],
    });
  }

  // Rule: For each beer control, returned quantity cannot be greater than taken quantity
  if (data.beerControl) {
    data.beerControl.forEach((beer, index) => {
      if (beer.quantityReturned > beer.quantityTaken) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A quantidade retornada não pode ser maior que a levada.',
          path: [`beerControl`, index, 'quantityReturned'],
        });
      }
    });
  }
});


export type EntryFormSchema = z.infer<typeof entryFormSchema>;