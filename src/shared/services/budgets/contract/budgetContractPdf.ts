import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { Budget } from "../types";
import { ConcludeModalValues } from "../../../../modules/protected/budgets/components/ConcludeModal";
import BudgetContractDocument, {
  BudgetContractDocumentProps,
} from "./BudgetContractDocument";

const PAYMENT_LABELS: Record<string, string> = {
  PIX: "PIX",
  CARTAO_CREDITO: "Cartão de Crédito",
  CARTAO_DEBITO: "Cartão de Débito",
  DINHEIRO: "Dinheiro",
  PARCELADO_50_50: "Parcelado 50/50",
};

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function safeFileName(name: string): string {
  return name.replace(/[^\w\-]+/g, "_").slice(0, 40) || "contrato";
}

function issuedAtISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function calcConsigned(budget: Budget): { liters: number; barrels: number } {
  const calc = budget.calculation;
  const supplied = calc.suppliedLiters ?? 0;
  const billing = calc.wasLitersAdjusted && calc.correctedLiters != null
    ? calc.correctedLiters
    : null;

  let consignedLiters: number;
  if (billing !== null && billing < supplied) {
    consignedLiters = billing;
  } else {
    const base = billing ?? supplied;
    consignedLiters = base + 30;
  }

  const barrels = Math.ceil(consignedLiters / 50);
  return { liters: consignedLiters, barrels };
}

function buildContractProps(
  budget: Budget,
  concludeValues: ConcludeModalValues,
): BudgetContractDocumentProps {
  const calc = budget.calculation;
  const contractedLiters =
    calc.wasLitersAdjusted && calc.correctedLiters != null
      ? calc.correctedLiters
      : (calc.suppliedLiters ?? calc.requiredLiters ?? 0);

  const { liters: consignedLiters, barrels: consignedBarrels } =
    calcConsigned(budget);

  const finalTotal = budget.finalTotal;
  const half = Math.round((finalTotal / 2) * 100) / 100;

  const hasCustomMugs = (budget.extras || []).some(
    (e) => e.extraId === "custom_mugs",
  );

  return {
    clientName: budget.clientName,
    clientCpf: concludeValues.cpf,
    eventDate: budget.eventDate ?? "",
    eventLocation: budget.eventLocation ?? "a definir",
    hours: budget.hours,
    people: budget.people,
    contractedLiters,
    consignedLiters,
    consignedBarrels,
    flavors: calc.flavorLines || budget.flavors || [],
    hasCustomMugs,
    finalTotal,
    firstInstallment: half,
    secondInstallment: finalTotal - half,
    signalDueDate: concludeValues.signalDueDate,
    paymentMethodLabel: PAYMENT_LABELS[concludeValues.paymentMethod] ?? concludeValues.paymentMethod,
    issuedAt: issuedAtISO(),
  };
}

export async function downloadBudgetContractPdf(params: {
  budget: Budget;
  concludeValues: ConcludeModalValues;
}): Promise<void> {
  const { budget, concludeValues } = params;
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const props = buildContractProps(budget, concludeValues);

  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.zIndex = "-1";
  host.style.pointerEvents = "none";
  document.body.appendChild(host);

  const root = createRoot(host);
  await new Promise<void>((resolve) => {
    root.render(createElement(BudgetContractDocument, props));
    requestAnimationFrame(() => resolve());
  });

  await wait(80);

  const el = host.querySelector("[data-budget-contract]") as HTMLElement | null;
  if (!el) {
    root.unmount();
    host.remove();
    throw new Error("Falha ao renderizar contrato");
  }

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const img = canvas.toDataURL("image/jpeg", 0.92);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgH = (canvas.height * pageW) / canvas.width;

    let y = 0;
    let remaining = imgH;
    let page = 0;
    while (remaining > 0) {
      if (page > 0) pdf.addPage();
      const sliceH = Math.min(pageH, remaining);
      pdf.addImage(img, "JPEG", 0, -y, pageW, imgH);
      y += sliceH;
      remaining -= sliceH;
      page++;
    }

    pdf.save(`contrato-${safeFileName(budget.clientName)}.pdf`);
  } finally {
    root.unmount();
    host.remove();
  }
}
