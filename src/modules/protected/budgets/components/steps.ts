import { BudgetFormValues } from "../../../../shared/services/budgets/schema";

export type BudgetStepKey =
  | "serviceType"
  | "people"
  | "duration"
  | "consumption"
  | "otherDrinks"
  | "flavors"
  | "flavorDistribution"
  | "distance"
  | "extras"
  | "review"
  | "client"
  | "orderReview";

export interface BudgetStepDefinition {
  key: BudgetStepKey;
  title: string;
  fields: (keyof BudgetFormValues)[];
}

const BASE_BEFORE_FLAVORS: BudgetStepDefinition[] = [
  { key: "serviceType", title: "Tipo de atendimento", fields: ["serviceType"] },
  { key: "people", title: "Quantidade de pessoas", fields: ["people"] },
  { key: "duration", title: "Tempo de evento", fields: ["hours"] },
  {
    key: "consumption",
    title: "Perfil de consumo",
    fields: ["consumptionProfile"],
  },
  {
    key: "otherDrinks",
    title: "Outras bebidas",
    fields: ["otherDrinks"],
  },
  { key: "flavors", title: "Sabores", fields: ["flavors"] },
];

const FLAVOR_DISTRIBUTION_STEP: BudgetStepDefinition = {
  key: "flavorDistribution",
  title: "Distribuição dos sabores",
  fields: ["flavors"],
};

const BASE_AFTER_FLAVORS: BudgetStepDefinition[] = [
  { key: "distance", title: "Distância", fields: ["distanceKm"] },
  { key: "extras", title: "Extras", fields: ["extras"] },
  { key: "review", title: "Revisão do orçamento", fields: [] },
  {
    key: "client",
    title: "Cliente",
    fields: ["clientName", "clientPhone", "clientCity", "eventDate", "notes"],
  },
  { key: "orderReview", title: "Revisão do pedido", fields: [] },
];

/** Dynamic steps: flavor distribution only when 2+ flavors selected. */
export function getBudgetSteps(
  flavors: BudgetFormValues["flavors"],
): BudgetStepDefinition[] {
  const needsDistribution = (flavors?.length ?? 0) > 1;
  return [
    ...BASE_BEFORE_FLAVORS,
    ...(needsDistribution ? [FLAVOR_DISTRIBUTION_STEP] : []),
    ...BASE_AFTER_FLAVORS,
  ];
}
