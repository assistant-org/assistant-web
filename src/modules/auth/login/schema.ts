import { z } from "zod";

export const loginFormSchema = z.object({
  email: z
    .string()
    .email("Informe um e-mail válido.")
    .min(1, "E-mail é obrigatório."),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
    .min(1, "Senha é obrigatória."),
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;
