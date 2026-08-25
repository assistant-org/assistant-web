import { createElement } from "react";

import { createRoot } from "react-dom/client";

import { Budget } from "../types";

import { ContractModalValues } from "../../../../modules/protected/budgets/components/ContractModal";

import BudgetContractDocument, {

  BudgetContractDocumentProps,

} from "./BudgetContractDocument";


import { CONTRACT_PDF_MARGIN_MM } from "./contract.layout";



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

  const billing =

    calc.wasLitersAdjusted && calc.correctedLiters != null

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



function buildClientAddressLine(values: ContractModalValues): string {

  const zip = values.clientZip.replace(/\D/g, "");

  const formattedZip =

    zip.length === 8 ? `${zip.slice(0, 5)}-${zip.slice(5)}` : values.clientZip;

  return `${values.clientStreet}, ${values.clientNumber}, ${formattedZip}, ${values.clientCityState}`;

}



function findReadableSliceEnd(
  element: HTMLElement,
  sourceY: number,
  maxHeight: number,
  scale: number,
): number {
  const limit = sourceY + maxHeight;
  const candidates: number[] = [limit];

  Array.from(element.children).forEach((child) => {
    const node = child as HTMLElement;
    const top = node.offsetTop * scale;
    const bottom = (node.offsetTop + node.offsetHeight) * scale;
    const isClauseHeading = node.textContent?.trim().startsWith("CLÁUSULA");

    if (top > sourceY + 80 && top <= limit) candidates.push(top);
    if (!isClauseHeading && bottom > sourceY + 80 && bottom <= limit) {
      candidates.push(bottom);
    }
  });

  return Math.max(
    sourceY + 1,
    candidates
      .filter((candidate) => candidate > sourceY)
      .sort((a, b) => b - a)[0] ?? limit,
  );
}

function buildContractProps(

  budget: Budget,

  contractValues: ContractModalValues,

): BudgetContractDocumentProps {

  const calc = budget.calculation;

  const flavors = calc.flavorLines || budget.flavors || [];

  const flavorLitersSum = flavors.reduce((sum, f) => sum + (f.liters || 0), 0);

  const contractedLiters =
    flavorLitersSum > 0
      ? flavorLitersSum
      : calc.wasLitersAdjusted && calc.correctedLiters != null
        ? calc.correctedLiters
        : (calc.suppliedLiters ?? calc.requiredLiters ?? 0);

  const { liters: consignedLiters, barrels: consignedBarrels } =
    calcConsigned(budget);

  const hasCustomMugs = (budget.extras || []).some(
    (e) => e.extraId === "custom_mugs",
  );

  const extraServices = (budget.extras || [])
    .filter(
      (e) =>
        e.amount > 0 &&
        e.extraId !== "custom_mugs" &&
        e.extraId !== "disposable_cups",
    )
    .map((e) => e.label);

  const finalTotal = budget.finalTotal;



  const half = Math.round((finalTotal / 2) * 100) / 100;



  return {

    clientName: budget.clientName,

    clientCpf: contractValues.cpf,

    clientAddressLine: buildClientAddressLine(contractValues),

    clientCityState: contractValues.clientCityState,

    eventDate: contractValues.eventDate || budget.eventDate || "",

    eventLocation: contractValues.eventLocation,

    hours: budget.hours,

    people: budget.people,

    contractedLiters,

    consignedLiters,

    consignedBarrels,

    flavors,

    hasCustomMugs,

    extraServices,

    finalTotal,

    firstInstallment: half,

    secondInstallment: Math.round((finalTotal - half) * 100) / 100,

    signalDueDate: contractValues.signalDueDate,

    issuedAt: issuedAtISO(),

    contractVariant:
      budget.serviceType === "AUTO_SERVICO" ? "auto_servico" : "standard",

  };

}



export async function downloadBudgetContractPdf(params: {

  budget: Budget;

  contractValues: ContractModalValues;

}): Promise<void> {

  const { budget, contractValues } = params;

  const html2canvas = (await import("html2canvas")).default;

  const { jsPDF } = await import("jspdf");



  const props = buildContractProps(budget, contractValues);



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



    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageW = pdf.internal.pageSize.getWidth();

    const pageH = pdf.internal.pageSize.getHeight();

    const margin = CONTRACT_PDF_MARGIN_MM;

    const contentW = pageW - margin * 2;

    const contentH = pageH - margin * 2;

    const pxPerMm = canvas.width / contentW;
    const pageSliceHeightPx = Math.max(1, Math.floor(contentH * pxPerMm));



    let sourceY = 0;
    let page = 0;

    while (sourceY < canvas.height) {

      if (page > 0) pdf.addPage();

      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      const readableEnd = findReadableSliceEnd(
        el,
        sourceY,
        pageSliceHeightPx,
        pxPerMm,
      );
      sliceCanvas.height = Math.min(
        readableEnd - sourceY,
        canvas.height - sourceY,
      );
      const sliceContext = sliceCanvas.getContext("2d");
      if (!sliceContext) {
        throw new Error("Falha ao preparar página do contrato");
      }
      sliceContext.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceCanvas.height,
        0,
        0,
        sliceCanvas.width,
        sliceCanvas.height,
      );
      const sliceHeightMm = sliceCanvas.height / pxPerMm;
      pdf.addImage(
        sliceCanvas.toDataURL("image/jpeg", 0.92),
        "JPEG",
        margin,
        margin,
        contentW,
        sliceHeightMm,
      );
      sourceY += sliceCanvas.height;

      page++;

    }



    const suffix =
      budget.serviceType === "AUTO_SERVICO" ? "auto-servico" : "padrao";

    pdf.save(`contrato-${suffix}-${safeFileName(budget.clientName)}.pdf`);

  } finally {

    root.unmount();

    host.remove();

  }

}


