import React from "react";
import Button from "../../../../shared/components/Button";
import {
  downloadBudgetProposalPdf,
  downloadBudgetProposalPng,
  toProposalPdfInput,
} from "../../../../shared/services/budgets/pdf/budgetProposalPdf";
import { buildWhatsAppLink } from "../../../../shared/services/budgets/whatsapp/buildWhatsAppLink";
import { Budget } from "../../../../shared/services/budgets/types";

interface BudgetProposalActionsProps {
  budget: Budget;
}

export default function BudgetProposalActions({
  budget,
}: BudgetProposalActionsProps) {
  const handlePdf = async () => {
    await downloadBudgetProposalPdf(toProposalPdfInput(budget));
  };

  const handlePng = async () => {
    await downloadBudgetProposalPng(toProposalPdfInput(budget));
  };

  const handleWhatsApp = () => {
    const url = buildWhatsAppLink({
      phone: budget.clientPhone,
      clientName: budget.clientName,
      serviceType: budget.serviceType,
      calculation: {
        ...budget.calculation,
        finalTotal: budget.finalTotal,
      },
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="secondary" onClick={() => void handlePdf()}>
        Baixar PDF
      </Button>
      <Button type="button" variant="secondary" onClick={() => void handlePng()}>
        Baixar imagem
      </Button>
      <Button type="button" onClick={handleWhatsApp}>
        Enviar para WhatsApp
      </Button>
    </div>
  );
}
