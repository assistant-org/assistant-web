import { getServiceTypeConfig } from "../budget.config";
import { formatCurrency, formatLiters } from "../format";
import { Budget, BudgetCalculationResult } from "../types";
import { BudgetFormValues } from "../schema";

export interface BudgetProposalPdfInput {
  clientName: string;
  clientPhone: string;
  clientCity: string;
  notes: string;
  serviceType: BudgetFormValues["serviceType"];
  calculation: BudgetCalculationResult;
  contactLine?: string;
}

/** Build PDF payload from a saved budget or live form + calculation. */
export function toProposalPdfInput(
  source: Budget | (BudgetFormValues & { calculation: BudgetCalculationResult }),
): BudgetProposalPdfInput {
  if (
    "clientName" in source &&
    "calculation" in source &&
    "finalTotal" in source &&
    "id" in source
  ) {
    const b = source as Budget;
    return {
      clientName: b.clientName,
      clientPhone: b.clientPhone,
      clientCity: b.clientCity,
      notes: b.notes,
      serviceType: b.serviceType,
      calculation: b.calculation,
    };
  }
  const f = source as BudgetFormValues & {
    calculation: BudgetCalculationResult;
  };
  return {
    clientName: f.clientName,
    clientPhone: f.clientPhone,
    clientCity: f.clientCity,
    notes: f.notes || "",
    serviceType: f.serviceType,
    calculation: f.calculation,
  };
}

export async function downloadBudgetProposalPdf(
  input: BudgetProposalPdfInput,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const service = getServiceTypeConfig(input.serviceType);
  const calc = input.calculation;
  const contracted =
    calc.suppliedLiters ?? calc.requiredLiters ?? calc.totalLiters;
  let y = 20;

  const line = (text: string, size = 11, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.text(text, 20, y);
    y += size * 0.55 + 4;
  };

  line("Assistant — Proposta Comercial", 18, true);
  line("Orcamento de Chopp", 12);
  y += 4;

  line(`Cliente: ${input.clientName}`, 11, true);
  line(`Telefone: ${input.clientPhone}`);
  line(`Cidade: ${input.clientCity}`);
  y += 4;

  line(`Tipo de atendimento: ${service.label}`, 11, true);
  line(`Quantidade contratada: ${formatLiters(contracted)}`, 12, true);
  y += 2;

  line("Sabores", 11, true);
  if (!calc.flavorLines.length) {
    line("—");
  } else {
    calc.flavorLines.forEach((f) => {
      line(`• ${f.name} — ${f.percent ?? "—"}%`);
    });
  }
  y += 4;

  line(`Valor final: ${formatCurrency(calc.finalTotal)}`, 14, true);
  y += 4;

  if (input.notes?.trim()) {
    line("Observacoes", 11, true);
    const notes = doc.splitTextToSize(input.notes.trim(), 170);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(notes, 20, y);
    y += notes.length * 5 + 4;
  }

  y += 6;
  line(
    input.contactLine || "Em caso de duvidas, fale conosco pelo WhatsApp.",
    10,
  );
  line("Documento sem detalhamento de custos internos.", 9);

  const safeName = input.clientName.replace(/[^\w\-]+/g, "_").slice(0, 40);
  doc.save(`orcamento-${safeName || "proposta"}.pdf`);
}
