import React from "react";
import { SERVICE_TYPES } from "../../../../shared/services/budgets/budget.config";
import { BudgetServiceType } from "../../../../shared/services/budgets/types";

interface StepServiceTypeProps {
  value: BudgetServiceType;
  onChange: (value: BudgetServiceType) => void;
  disabled?: boolean;
}

export default function StepServiceType({
  value,
  onChange,
  disabled,
}: StepServiceTypeProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {SERVICE_TYPES.map((service) => {
        const selected = value === service.id;
        return (
          <button
            key={service.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(service.id)}
            className={`text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
              selected
                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 shadow-md scale-[1.01]"
                : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 bg-white dark:bg-gray-800"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="text-3xl mb-2">
              {service.id === "TOTEM" ? "🍺" : "🚐"}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {service.label}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {service.description}
            </p>
            <ul className="mt-3 space-y-1">
              {service.includes.map((item) => (
                <li
                  key={item}
                  className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5"
                >
                  <span className="text-indigo-500">✓</span> {item}
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
