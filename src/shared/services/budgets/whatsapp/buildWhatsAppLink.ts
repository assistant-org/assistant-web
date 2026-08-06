import { getServiceTypeConfig } from "../budget.config";
import { digitsOnlyPhone, formatCurrency, formatLiters } from "../format";
import { BudgetCalculationResult, BudgetServiceType } from "../types";

export function buildWhatsAppLink(params: {
  phone: string;
  clientName: string;
  serviceType: BudgetServiceType;
  calculation: BudgetCalculationResult;
}): string {
  const digits = digitsOnlyPhone(params.phone);
  const withCountry =
    digits.length >= 12 && digits.startsWith("55")
      ? digits
      : digits.length >= 10
        ? `55${digits}`
        : digits;

  const service = getServiceTypeConfig(params.serviceType);
  const calc = params.calculation;
  const contracted =
    calc.suppliedLiters ?? calc.requiredLiters ?? calc.totalLiters;

  const flavorLines =
    calc.flavorLines.length > 0
      ? calc.flavorLines
          .map((f) => `• ${f.name} — ${f.percent ?? "—"}%`)
          .join("\n")
      : "• —";

  const message = [
    `🍻 Olá, *${params.clientName}*!`,
    ``,
    `Preparamos uma proposta personalizada para o seu evento.`,
    ``,
    `📍 Atendimento: ${service.label}`,
    `👥 Convidados: ${calc.people}`,
    `⏰ Duração: ${calc.hours} horas`,
    `🍺 Quantidade recomendada: ${formatLiters(contracted)}`,
    ``,
    `Sabores escolhidos:`,
    flavorLines,
    ``,
    `💰 Investimento:`,
    `*${formatCurrency(calc.finalTotal)}*`,
    ``,
    `Nossa proposta já considera toda a estrutura necessária para que seu evento aconteça sem preocupações.`,
    ``,
    `✅ Equipamentos completos`,
    `✅ Instalação`,
    `✅ Regulagem`,
    `✅ Suporte durante o evento (quando aplicável)`,
    ``,
    `Segue também o orçamento em PDF com todos os detalhes.`,
    ``,
    `Qualquer dúvida estou à disposição! 🍻`,
  ].join("\n");

  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}
