import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  active: z.boolean(),
});

export type ProductFormSchema = z.infer<typeof productFormSchema>;
