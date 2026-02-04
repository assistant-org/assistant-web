import { z } from 'zod';
import { CategoryType } from './types';

export const categoryFormSchema = z.object({
  name: z.string().min(1, 'O nome da categoria é obrigatório.'),
  type: z.nativeEnum(CategoryType, { required_error: 'O tipo é obrigatório.' }),
  allowsSingleEvent: z.boolean().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Formato de cor inválido. Use #RRGGBB').optional(),
  description: z.string().optional(),
});

export type CategoryFormSchema = z.infer<typeof categoryFormSchema>;
