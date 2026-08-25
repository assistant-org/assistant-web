export const PROPOSAL_BRAND = {
  name: "Na Estrada Chopp",
  logoSrc: "/brand/logo-na-estrada-chopp.png",
  validityDays: 10,
  validityLabel: "Este orçamento é válido por 10 dias",
  instagram: "@naestradachopp",
  email: "naestradachopp@gmail.com",
  cnpj: "55.817.511/0001-92",
  paymentMethods: [
    {
      id: "parcelado_50_50",
      title: "Parcelado 50/50",
      detail:
        "50% na assinatura do contrato / 50% até 5 dias antes do evento.",
    },
    {
      id: "cartao_credito",
      title: "Cartão de Crédito",
      detail: "Consulte condições de parcelamento e taxas.",
    },
    {
      id: "pix",
      title: "PIX",
      detail:
        "Chave fornecida após assinatura do contrato / Confirmação imediata.",
    },
    {
      id: "dinheiro",
      title: "Dinheiro",
      detail: "Válido para pagamentos à vista.",
    },
    {
      id: "cartao_debito",
      title: "Cartão de Débito",
      detail: "Pagamento presencial no momento da contratação.",
    },
  ],
} as const;

/** Marketing service titles for the client-facing proposal. */
export const PROPOSAL_SERVICE_TITLES: Record<
  "TOTEM" | "KOMBI" | "AUTO_SERVICO",
  string
> = {
  TOTEM: "Totem de Chopp",
  KOMBI: "Kombi de Chopp",
  AUTO_SERVICO: "Auto serviço",
};

export function buildGiftLine(people: number): string {
  const n = Math.max(0, Math.round(people));
  return `${n} Canecas de Acrílico Personalizadas — entregues higienizadas e embaladas.`;
}
