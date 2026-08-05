import React from "react";
import { TransactionType } from "../../../../shared/services/transactions/types";

interface TransactionTypeSwitchProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
  disabled?: boolean;
}

const OPTIONS: {
  type: TransactionType.INCOME | TransactionType.EXPENSE;
  label: string;
  activeClass: string;
}[] = [
  {
    type: TransactionType.INCOME,
    label: "Receita",
    activeClass: "bg-green-600 text-white shadow-sm",
  },
  {
    type: TransactionType.EXPENSE,
    label: "Despesa",
    activeClass: "bg-red-600 text-white shadow-sm",
  },
];

const TransactionTypeSwitch: React.FC<TransactionTypeSwitchProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div
      role="tablist"
      aria-label="Tipo de movimentação"
      className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 dark:bg-gray-900 p-1"
    >
      {OPTIONS.map((option) => {
        const isActive = value === option.type;
        return (
          <button
            key={option.type}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onChange(option.type)}
            className={`rounded-md py-2.5 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
              isActive
                ? option.activeClass
                : "text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default TransactionTypeSwitch;
