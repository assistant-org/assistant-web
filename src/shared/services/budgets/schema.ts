import { z } from "zod";
import {
  DISTANCE_MAX,
  DISTANCE_MIN,
  DURATION_OPTIONS,
  MAX_FLAVORS,
  PEOPLE_MAX,
  PEOPLE_MIN,
  BUDGET_EXTRAS,
  getDefaultConsumptionProfileId,
} from "./budget.config";

export const budgetFlavorSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  unitPrice: z.number().min(0),
  percent: z.number().min(0).max(100),
});

export const budgetExtraSchema = z.object({
  extraId: z
    .string()
    .min(1)
    .refine((id) => BUDGET_EXTRAS.some((e) => e.id === id), {
      message: "Serviço extra inválido",
    }),
});

export const budgetFormSchema = z.object({
  serviceType: z.enum(["TOTEM", "KOMBI"]),
  people: z
    .number()
    .min(PEOPLE_MIN)
    .max(PEOPLE_MAX)
    .refine((n) => n % 5 === 0, { message: "Incremento de 5 pessoas" }),
  hours: z
    .number()
    .refine((h) => (DURATION_OPTIONS as readonly number[]).includes(h), {
      message: "Duração inválida",
    }),
  consumptionProfile: z.enum(["CASUAL", "MODERATE", "HIGH"]),
  otherDrinks: z.boolean(),
  distanceKm: z
    .number()
    .min(DISTANCE_MIN)
    .max(DISTANCE_MAX)
    .refine((n) => n % 5 === 0, { message: "Incremento de 5 km" }),
  flavors: z
    .array(budgetFlavorSchema)
    .min(1, "Selecione ao menos um sabor")
    .max(MAX_FLAVORS, "Máximo de 3 sabores")
    .superRefine((flavors, ctx) => {
      const total = flavors.reduce((s, f) => s + f.percent, 0);
      if (Math.round(total) !== 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A distribuição dos sabores deve somar 100%",
        });
      }
    }),
  extras: z.array(budgetExtraSchema),
  correctedLiters: z.number().positive().nullable().optional(),
  clientName: z.string().min(1, "Nome obrigatório"),
  clientPhone: z.string().min(8, "Telefone obrigatório"),
  clientCity: z.string().min(1, "Cidade obrigatória"),
  notes: z.string(),
  negotiatedTotal: z.number().min(0).nullable().optional(),
  adjustmentReason: z.string().nullable().optional(),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;

export const budgetFormDefaults = (): BudgetFormValues => ({
  serviceType: "TOTEM",
  people: 50,
  hours: 5,
  consumptionProfile: getDefaultConsumptionProfileId(),
  otherDrinks: false,
  distanceKm: 10,
  flavors: [],
  extras: [],
  correctedLiters: null,
  clientName: "",
  clientPhone: "",
  clientCity: "",
  notes: "",
  negotiatedTotal: null,
  adjustmentReason: null,
});
