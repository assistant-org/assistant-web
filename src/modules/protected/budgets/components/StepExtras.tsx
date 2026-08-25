import React, { useState } from "react";
import Button from "../../../../shared/components/Button";
import { BUDGET_EXTRAS } from "../../../../shared/services/budgets/budget.config";
import { BudgetFormValues } from "../../../../shared/services/budgets/schema";

interface StepExtrasProps {
  value: BudgetFormValues["extras"];
  onChange: (extras: BudgetFormValues["extras"]) => void;
  disabled?: boolean;
}

/** Auto-calculated extras are not user-selectable. */
const AUTO_EXTRAS = new Set(["disposable_cups"]);

const EXTRA_OPTIONS = BUDGET_EXTRAS.filter(
  (e) => !AUTO_EXTRAS.has(e.id),
).map((e) => ({
  id: e.id,
  label: e.label,
}));

export default function StepExtras({
  value,
  onChange,
  disabled,
}: StepExtrasProps) {
  const [open, setOpen] = useState(false);
  // Ignore auto-calculated extras that may have been persisted on the budget.
  const userValue = value.filter((e) => !AUTO_EXTRAS.has(e.extraId));
  const usedIds = new Set(userValue.map((e) => e.extraId));

  const availableFor = (index: number) => {
    const currentId = userValue[index]?.extraId;
    return EXTRA_OPTIONS.filter(
      (opt) => opt.id === currentId || !usedIds.has(opt.id),
    );
  };

  const addRow = () => {
    const next = EXTRA_OPTIONS.find((opt) => !usedIds.has(opt.id));
    if (!next) return;
    onChange([...userValue, { extraId: next.id }]);
  };

  const updateRow = (index: number, extraId: string) => {
    const next = [...userValue];
    next[index] = { extraId };
    onChange(next);
  };

  const removeRow = (index: number) => {
    onChange(userValue.filter((_, i) => i !== index));
  };

  const canAdd = EXTRA_OPTIONS.some((opt) => !usedIds.has(opt.id));

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/80 text-left"
      >
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            Serviços extras
          </p>
          <p className="text-xs text-gray-500">
            {userValue.length
              ? `${userValue.length} serviço(s) selecionado(s)`
              : "Opcional — fechado por padrão"}
          </p>
        </div>
        <span className="text-gray-400 text-lg">{open ? "▴" : "▾"}</span>
      </button>

      {open ? (
        <div className="p-4 space-y-3 bg-white dark:bg-gray-800">
          {userValue.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum extra adicionado.</p>
          ) : (
            userValue.map((row, index) => (
              <div key={`extra-row-${index}`} className="flex gap-2">
                <select
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
                  value={row.extraId}
                  disabled={disabled}
                  onChange={(e) => updateRow(index, e.target.value)}
                >
                  {availableFor(index).map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => removeRow(index)}
                  disabled={disabled}
                >
                  Remover
                </Button>
              </div>
            ))
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={addRow}
            disabled={disabled || !canAdd}
            fullWidth
          >
            + Adicionar outro serviço
          </Button>
        </div>
      ) : null}
    </div>
  );
}
