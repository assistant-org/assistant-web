import React, { useState } from "react";
import Button from "../../../../shared/components/Button";
import Modal from "../../../../shared/components/Modal";
import { getServiceTypeConfig } from "../../../../shared/services/budgets/budget.config";
import {
  formatCurrency,
  formatLiters,
} from "../../../../shared/services/budgets/format";
import { Budget } from "../../../../shared/services/budgets/types";
import { formatDateBR } from "../../../../shared/utils/formatDate";
import BudgetDownloadModal from "./BudgetDownloadModal";

interface BudgetGeneratedModalProps {
  budget: Budget;
  onClose: () => void;
  onNeedPhone: (budget: Budget) => void;
}

function billingLiters(budget: Budget): number {
  const calc = budget.calculation;
  if (calc.wasLitersAdjusted && calc.correctedLiters != null) {
    return calc.correctedLiters;
  }
  return calc.suppliedLiters ?? calc.requiredLiters ?? calc.totalLiters ?? 0;
}

export default function BudgetGeneratedModal({
  budget,
  onClose,
  onNeedPhone,
}: BudgetGeneratedModalProps) {
  const [showDownload, setShowDownload] = useState(false);

  return (
    <>
      <Modal isOpen title="Orçamento gerado" onClose={onClose}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Proposta para <strong>{budget.clientName}</strong> —{" "}
            {getServiceTypeConfig(budget.serviceType).label}
          </p>
          {budget.eventDate ? (
            <p className="text-sm text-gray-500">
              Evento: {formatDateBR(budget.eventDate)}
            </p>
          ) : null}
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatCurrency(budget.finalTotal)}
          </p>
          <p className="text-sm text-gray-500">
            {formatLiters(billingLiters(budget))} contratados
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" onClick={() => setShowDownload(true)}>
              Baixar
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
      {showDownload ? (
        <BudgetDownloadModal
          budget={budget}
          onClose={() => setShowDownload(false)}
          onNeedPhone={(b) => {
            setShowDownload(false);
            onNeedPhone(b);
          }}
        />
      ) : null}
    </>
  );
}
