import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { getServiceTypeConfig } from "../budget.config";
import { formatLiters } from "../format";
import {
  Budget,
  BudgetCalculationResult,
  BudgetExtraLine,
  BudgetFlavorLine,
  BudgetServiceType,
} from "../types";
import { BudgetFormValues } from "../schema";
import BudgetProposalDocument from "./BudgetProposalDocument";

export interface BudgetProposalPdfInput {
  clientName: string;
  clientPhone: string;
  clientCity: string;
  notes: string;
  serviceType: BudgetFormValues["serviceType"];
  calculation: BudgetCalculationResult;
  people?: number;
  hours?: number;
  flavors?: BudgetFlavorLine[];
  extras?: BudgetExtraLine[];
  contactLine?: string;
  issuedAt?: string;
}

function contractedLiters(calc: BudgetCalculationResult): number {
  if (calc.wasLitersAdjusted && calc.correctedLiters != null) {
    return calc.correctedLiters;
  }
  return calc.suppliedLiters ?? calc.requiredLiters ?? calc.totalLiters ?? 0;
}

function issuedAtBR(iso?: string): string {
  if (iso && /^\d{4}-\d{2}-\d{2}/.test(iso)) {
    const [y, m, d] = iso.slice(0, 10).split("-");
    return `${d}/${m}/${y}`;
  }
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${now.getFullYear()}`;
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForImages(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
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
      calculation: {
        ...b.calculation,
        finalTotal: b.finalTotal,
      },
      people: b.people,
      hours: b.hours,
      flavors: b.flavors?.length ? b.flavors : b.calculation.flavorLines,
      extras: b.extras?.length ? b.extras : b.calculation.extraLines,
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
    people: f.people,
    hours: f.hours,
    flavors: f.calculation.flavorLines,
    extras: f.calculation.extraLines,
  };
}

function resolveDocProps(input: BudgetProposalPdfInput) {
  const calc = input.calculation;
  const people = input.people ?? calc.people ?? 0;
  const hours = input.hours ?? calc.hours ?? 0;
  const flavors = input.flavors?.length
    ? input.flavors
    : calc.flavorLines || [];
  const extras = input.extras?.length ? input.extras : calc.extraLines || [];
  // Main row shows package total; extras with amount>0 listed separately.
  // Avoid double-counting in display: show finalTotal as unique package value.
  return {
    clientName: input.clientName,
    issuedAt: issuedAtBR(input.issuedAt),
    serviceType: input.serviceType as BudgetServiceType,
    people,
    hours,
    contractedLiters: contractedLiters(calc),
    flavors,
    extras,
    total: calc.finalTotal,
    includeGift: true,
  };
}

async function renderProposalCanvas(
  input: BudgetProposalPdfInput,
): Promise<HTMLCanvasElement> {
  const html2canvas = (await import("html2canvas")).default;

  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.zIndex = "-1";
  host.style.pointerEvents = "none";
  document.body.appendChild(host);

  const root = createRoot(host);
  const props = resolveDocProps(input);

  await new Promise<void>((resolve) => {
    root.render(createElement(BudgetProposalDocument, props));
    requestAnimationFrame(() => resolve());
  });

  await waitForImages(host);
  await wait(80);

  const el = host.querySelector(
    "[data-budget-proposal]",
  ) as HTMLElement | null;
  if (!el) {
    root.unmount();
    host.remove();
    throw new Error("Falha ao renderizar o orçamento");
  }

  try {
    return await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#f7f3eb",
      logging: false,
    });
  } finally {
    root.unmount();
    host.remove();
  }
}

function safeFileName(clientName: string): string {
  return clientName.replace(/[^\w\-]+/g, "_").slice(0, 40) || "proposta";
}

export async function downloadBudgetProposalPdf(
  input: BudgetProposalPdfInput,
): Promise<void> {
  const canvas = await renderProposalCanvas(input);
  const { jsPDF } = await import("jspdf");
  const img = canvas.toDataURL("image/jpeg", 0.92);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * pageW) / canvas.width;
  const h = Math.min(imgH, pageH);
  pdf.addImage(img, "JPEG", 0, 0, imgW, h);
  pdf.save(`orcamento-${safeFileName(input.clientName)}.pdf`);
}

export async function downloadBudgetProposalPng(
  input: BudgetProposalPdfInput,
): Promise<void> {
  const canvas = await renderProposalCanvas(input);
  const link = document.createElement("a");
  link.download = `orcamento-${safeFileName(input.clientName)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/** Kept for callers that only need a text summary (e.g. debug). */
export function buildProposalSummaryText(input: BudgetProposalPdfInput): string {
  const service = getServiceTypeConfig(input.serviceType);
  const calc = input.calculation;
  return [
    service.label,
    formatLiters(contractedLiters(calc)),
    `Total: ${calc.finalTotal}`,
  ].join(" · ");
}
