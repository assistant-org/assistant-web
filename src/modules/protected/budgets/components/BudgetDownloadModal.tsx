import React from "react";
import { FileDown, Image, MessageCircle } from "lucide-react";
import Button from "../../../../shared/components/Button";
import Modal from "../../../../shared/components/Modal";
import { isValidPhoneBR } from "../../../../shared/services/budgets/format";
import {
  downloadBudgetProposalPdf,
  downloadBudgetProposalPng,
  toProposalPdfInput,
} from "../../../../shared/services/budgets/pdf/budgetProposalPdf";
import { Budget } from "../../../../shared/services/budgets/types";
import { buildWhatsAppLink } from "../../../../shared/services/budgets/whatsapp/buildWhatsAppLink";

interface BudgetDownloadModalProps {
  budget: Budget;
  onClose: () => void;
  /** Called when WhatsApp is requested but phone is missing/invalid. */
  onNeedPhone?: (budget: Budget) => void;
}

function openWhatsApp(budget: Budget) {
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
}

export default function BudgetDownloadModal({
  budget,
  onClose,
  onNeedPhone,
}: BudgetDownloadModalProps) {
  const handlePdf = async () => {
    await downloadBudgetProposalPdf(toProposalPdfInput(budget));
    onClose();
  };

  const handlePng = async () => {
    await downloadBudgetProposalPng(toProposalPdfInput(budget));
    onClose();
  };

  const handleWhatsApp = () => {
    if (!isValidPhoneBR(budget.clientPhone || "")) {
      onNeedPhone?.(budget);
      return;
    }
    openWhatsApp(budget);
    onClose();
  };

  return (
    <Modal isOpen title="Baixar orçamento" onClose={onClose}>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Escolha o formato para <strong>{budget.clientName}</strong>
      </p>
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handlePdf()}
          className="!justify-start gap-2"
        >
          <FileDown className="h-4 w-4" />
          Baixar PDF
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handlePng()}
          className="!justify-start gap-2"
        >
          <Image className="h-4 w-4" />
          Baixar imagem
        </Button>
        <Button
          type="button"
          onClick={handleWhatsApp}
          className="!justify-start gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Enviar para WhatsApp
        </Button>
      </div>
    </Modal>
  );
}

export { openWhatsApp };
