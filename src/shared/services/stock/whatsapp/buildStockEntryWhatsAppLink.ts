import { digitsOnlyPhone } from "../../budgets/format";
import { formatDateBR } from "../../../utils/formatDate";

export interface StockEntryNotifyLine {
  productName: string;
  quantity: number;
}

function withBrazilCountry(digits: string): string {
  if (digits.length >= 12 && digits.startsWith("55")) return digits;
  if (digits.length >= 10) return `55${digits}`;
  return digits;
}

export function buildStockEntryWhatsAppLink(params: {
  phone: string;
  lines: StockEntryNotifyLine[];
  entryDate?: string | null;
}): string {
  const withCountry = withBrazilCountry(digitsOnlyPhone(params.phone));

  const productLines =
    params.lines.length > 0
      ? params.lines
          .map(
            (l) =>
              `• ${l.productName} — ${l.quantity.toLocaleString("pt-BR", {
                maximumFractionDigits: 2,
              })} L`,
          )
          .join("\n")
      : "• —";

  const totalLiters = params.lines.reduce((s, l) => s + (l.quantity || 0), 0);
  const dateLabel = params.entryDate
    ? formatDateBR(params.entryDate)
    : null;

  const message = [
    `Olá! Segue o pedido de entrada de estoque.`,
    ``,
    ...(dateLabel ? [`📅 Data: ${dateLabel}`, ``] : []),
    `Produtos:`,
    productLines,
    ``,
    `📦 Total: ${totalLiters.toLocaleString("pt-BR", {
      maximumFractionDigits: 2,
    })} L`,
    ``,
    `Qualquer dúvida, estou à disposição.`,
  ].join("\n");

  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}
