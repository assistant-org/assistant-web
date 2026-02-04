import { z } from 'zod';
import { StockCategory, ExitReason } from './types';

export const stockItemFormSchema = z.object({
  productName: z.string().min(1, 'O nome do produto é obrigatório.'),
  category: z.nativeEnum(StockCategory, { required_error: 'A categoria é obrigatória.' }),
  entryDate: z.string().min(1, 'A data de entrada é obrigatória.'),
  expiryDate: z.string().min(1, 'A data de validade é obrigatória.'),
  unitLiters: z.number({ required_error: 'A litragem é obrigatória' }).positive('A litragem deve ser positiva.'),
  unitCount: z.number({ required_error: 'A quantidade de unidades é obrigatória' }).int().positive('A quantidade de unidades deve ser positiva.'),
  // FIX: Add unitPrice to the schema for validation.
  unitPrice: z.number({ required_error: 'O preço unitário é obrigatório' }).positive('O preço deve ser positivo.'),
  observations: z.string().optional(),
});

export type StockItemFormSchema = z.infer<typeof stockItemFormSchema>;


export const stockExitFormSchema = z.object({
  quantity: z.number().min(0.01, 'A quantidade deve ser maior que zero.'),
  reason: z.nativeEnum(ExitReason, { required_error: 'O motivo é obrigatório.' }),
});

export type StockExitFormSchema = z.infer<typeof stockExitFormSchema>;