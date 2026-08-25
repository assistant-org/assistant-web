import {
  BudgetCalculateInput,
  BudgetServiceType,
  ConsumptionProfileId,
} from "./types";

export interface ServiceTypeConfig {
  id: BudgetServiceType;
  label: string;
  description: string;
  includes: string[];
  /** Internal operational cost — never shown to the client. */
  operational: {
    mode: "fixed" | "hourly";
    amount: number;
  };
  distanceRatePerKm: number;
}

export interface ConsumptionProfileConfig {
  id: ConsumptionProfileId;
  label: string;
  litersPerPersonPerHour: number;
  isDefault?: boolean;
}

export interface ExtraCalcContext {
  hours: number;
  people: number;
  serviceType: BudgetServiceType;
  distanceKm: number;
  billingLiters: number;
  /** Flavor names (lower-cased) for tasting price logic. */
  flavors: string[];
}

export interface ExtraServiceDefinition {
  id: string;
  label: string;
  description?: string;
  /** When true, operational cost is zeroed. */
  flags?: {
    waiveOperationalCost?: boolean;
  };
  calc: (ctx: ExtraCalcContext) => number;
}

export const OTHER_DRINKS_FACTOR = 0.8;

export const PEOPLE_STEP = 5;
export const DISTANCE_STEP = 5;
export const PEOPLE_MIN = 10;
export const PEOPLE_MAX = 500;
export const DISTANCE_MIN = 0;
export const DISTANCE_MAX = 200;

/** Available keg sizes (liters), largest first for planning. */
export const KEG_SIZES = [50, 30] as const;

export type KegSize = (typeof KEG_SIZES)[number];

export const DURATION_OPTIONS = [2, 3, 4, 5, 6, 7, 8] as const;

/** Max beer flavors selectable in a budget proposal. */
export const MAX_FLAVORS = 3;

/** Clamp and snap a numeric input to the nearest step. */
export function snapToStep(
  value: number,
  min: number,
  max: number,
  step: number,
): number {
  if (!Number.isFinite(value)) return min;
  const clamped = Math.min(max, Math.max(min, value));
  return Math.round(clamped / step) * step;
}

export const SERVICE_TYPES: ServiceTypeConfig[] = [
  {
    id: "TOTEM",
    label: "Totem de Chopp",
    description: "Montagem, chopeira, cilindro, instalação e retirada.",
    includes: ["montagem", "chopeira", "cilindro", "instalação", "retirada"],
    operational: { mode: "fixed", amount: 400 },
    distanceRatePerKm: 0.9,
  },
  {
    id: "KOMBI",
    label: "Kombi de Chopp",
    description:
      "Equipe, chopeiras, estrutura completa, montagem, desmontagem e atendimento.",
    includes: [
      "equipe",
      "chopeiras",
      "estrutura completa",
      "montagem",
      "desmontagem",
      "atendimento durante o evento",
    ],
    operational: { mode: "hourly", amount: 160 },
    distanceRatePerKm: 2.2,
  },
  {
    id: "AUTO_SERVICO",
    label: "Auto serviço",
    description:
      "Chopp, chopeira e materiais para extração; operação feita pelo cliente.",
    includes: [
      "chopp",
      "equipamentos de extração",
      "copos ou canecas",
      "montagem básica",
      "retirada",
    ],
    operational: { mode: "fixed", amount: 0 },
    distanceRatePerKm: 0.9,
  },
];

export const CONSUMPTION_PROFILES: ConsumptionProfileConfig[] = [
  {
    id: "CASUAL",
    label: "Casual",
    litersPerPersonPerHour: 0.4,
  },
  {
    id: "MODERATE",
    label: "Moderado",
    litersPerPersonPerHour: 0.5,
    isDefault: true,
  },
  {
    id: "HIGH",
    label: "Alto consumo",
    litersPerPersonPerHour: 0.7,
  },
];

export const BUDGET_EXTRAS: ExtraServiceDefinition[] = [
  {
    id: "operator",
    label: "Operador",
    description: "R$ 90,00 por hora do evento",
    calc: ({ hours }) => hours * 90,
  },
  {
    id: "partnership",
    label: "Parceria",
    description: "Zera o custo operacional interno (Totem/Kombi)",
    flags: { waiveOperationalCost: true },
    calc: () => 0,
  },
  {
    id: "custom_mugs",
    label: "Canecas personalizadas",
    description: "R$ 3,00 por pessoa (1 caneca por convidado)",
    calc: ({ people }) => people * 3,
  },
  {
    id: "tasting",
    label: "Degustação",
    description: "Degustação gratuita dos chopps selecionados",
    calc: ({ flavors }) => {
      const isPilsenOnly =
        flavors.length > 0 && flavors.every((f) => f.includes("pilsen"));
      const growlerCost =
        flavors.length === 1 && isPilsenOnly ? 12 : 14 * flavors.length;
      return growlerCost + 20 + 10;
    },
  },
];

export const AUTO_SERVICO_PILSEN_PRICE = 14.5;
export const AUTO_SERVICO_OTHER_PRICE = 15.9;

export function getFlavorUnitPrice(
  serviceType: BudgetServiceType,
  flavorName: string,
  productDefaultPrice: number,
): number {
  if (serviceType !== "AUTO_SERVICO") return productDefaultPrice;
  return /pilsen/i.test(flavorName)
    ? AUTO_SERVICO_PILSEN_PRICE
    : AUTO_SERVICO_OTHER_PRICE;
}

export function getServiceTypeConfig(
  id: BudgetServiceType,
): ServiceTypeConfig {
  const found = SERVICE_TYPES.find((s) => s.id === id);
  if (!found) {
    throw new Error(`Unknown service type: ${id}`);
  }
  return found;
}

export function getConsumptionProfile(
  id: ConsumptionProfileId,
): ConsumptionProfileConfig {
  const found = CONSUMPTION_PROFILES.find((p) => p.id === id);
  if (!found) {
    throw new Error(`Unknown consumption profile: ${id}`);
  }
  return found;
}

export function getExtraDefinition(id: string): ExtraServiceDefinition | undefined {
  return BUDGET_EXTRAS.find((e) => e.id === id);
}

export function getDefaultConsumptionProfileId(): ConsumptionProfileId {
  return (
    CONSUMPTION_PROFILES.find((p) => p.isDefault)?.id ??
    CONSUMPTION_PROFILES[0].id
  );
}

export function buildExtraCalcContext(
  input: Pick<
    BudgetCalculateInput,
    "hours" | "people" | "serviceType" | "distanceKm" | "flavors"
  >,
  billingLiters: number,
): ExtraCalcContext {
  return {
    hours: input.hours,
    people: input.people,
    serviceType: input.serviceType,
    distanceKm: input.distanceKm,
    billingLiters,
    flavors: input.flavors.map((f) => f.name.toLowerCase()),
  };
}
