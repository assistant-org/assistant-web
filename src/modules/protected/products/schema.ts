import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  defaultUnitValue: z
    .number({ error: "Preço padrão é obrigatório" })
    .min(0, "Preço não pode ser negativo"),
  active: z.boolean(),
});

export type ProductFormSchema = z.infer<typeof productFormSchema>;
