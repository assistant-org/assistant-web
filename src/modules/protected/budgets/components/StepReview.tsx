import React from "react";
import BudgetPreview from "./BudgetPreview";
import {
  BudgetCalculationResult,
  BudgetServiceType,
} from "../../../../shared/services/budgets/types";

interface StepReviewProps {
  result: BudgetCalculationResult | null;
  serviceType: BudgetServiceType;
  negotiatedTotal: number | null | undefined;
  adjustmentReason: string | null | undefined;
  onNegotiatedChange: (value: number | null) => void;
  onReasonChange: (value: string) => void;
  correctedLiters?: number | null;
  onCorrectedLitersChange?: (value: number | null) => void;
  disabled?: boolean;
}

export default function StepReview({
  result,
  serviceType,
  negotiatedTotal,
  adjustmentReason,
  onNegotiatedChange,
  onReasonChange,
  correctedLiters,
  onCorrectedLitersChange,
  disabled,
}: StepReviewProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-center text-gray-500 dark:text-gray-400">
        Confira o cálculo. Volte para editar ou continue para os dados do
        cliente.
      </p>
      <BudgetPreview
        result={result}
        serviceType={serviceType}
        negotiatedTotal={negotiatedTotal}
        adjustmentReason={adjustmentReason}
        onNegotiatedChange={onNegotiatedChange}
        onReasonChange={onReasonChange}
        correctedLiters={correctedLiters}
        onCorrectedLitersChange={onCorrectedLitersChange}
        allowLiterCorrection
        disabled={disabled}
      />
    </div>
  );
}
