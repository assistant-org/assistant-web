import React from "react";
import TransactionTypeSwitch from "../TransactionTypeSwitch";
import { TransactionType } from "../../../../../shared/services/transactions/types";

interface StepTypeSelectProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
  disabled?: boolean;
}

export default function StepTypeSelect({ value, onChange, disabled }: StepTypeSelectProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Qual o tipo dessa movimentação?
      </p>
      <TransactionTypeSwitch value={value} onChange={onChange} disabled={disabled} />
    </div>
  );
}
