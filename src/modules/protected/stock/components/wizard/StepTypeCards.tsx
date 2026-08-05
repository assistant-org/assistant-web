import React from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  Coffee,
} from "lucide-react";
import { StockMovementType } from "../../../../../shared/services/stock/types";

const TYPES: {
  type: StockMovementType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    type: StockMovementType.ENTRY,
    label: "Entrada",
    description: "Nova compra / lote de chopp",
    icon: <ArrowDownToLine className="h-6 w-6" />,
  },
  {
    type: StockMovementType.EXIT,
    label: "Saída",
    description: "Baixa por venda ou uso",
    icon: <ArrowUpFromLine className="h-6 w-6" />,
  },
  {
    type: StockMovementType.LOSS,
    label: "Perda",
    description: "Desperdício ou avaria",
    icon: <AlertTriangle className="h-6 w-6" />,
  },
  {
    type: StockMovementType.INTERNAL_CONSUMPTION,
    label: "Consumo Interno",
    description: "Uso interno da operação",
    icon: <Coffee className="h-6 w-6" />,
  },
];

interface StepTypeCardsProps {
  value: StockMovementType;
  onChange: (type: StockMovementType) => void;
  disabled?: boolean;
}

export default function StepTypeCards({ value, onChange, disabled }: StepTypeCardsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Qual o tipo desta movimentação?
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TYPES.map((item) => {
          const selected = value === item.type;
          return (
            <button
              key={item.type}
              type="button"
              disabled={disabled}
              onClick={() => onChange(item.type)}
              className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                selected
                  ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
                  : "border-gray-200 dark:border-gray-700 hover:border-indigo-300"
              }`}
            >
              <span
                className={`mt-0.5 ${selected ? "text-indigo-600" : "text-gray-400"}`}
              >
                {item.icon}
              </span>
              <span>
                <span className="block font-semibold text-gray-900 dark:text-white">
                  {item.label}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
