import React, { useEffect, useState } from "react";
import {
  PEOPLE_MAX,
  PEOPLE_MIN,
  PEOPLE_STEP,
  snapToStep,
} from "../../../../shared/services/budgets/budget.config";

interface StepPeopleProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function StepPeople({
  value,
  onChange,
  disabled,
}: StepPeopleProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const parsed = Number(draft.replace(",", "."));
    const next = snapToStep(parsed, PEOPLE_MIN, PEOPLE_MAX, PEOPLE_STEP);
    setDraft(String(next));
    onChange(next);
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="text-center">
        <input
          type="text"
          inputMode="numeric"
          disabled={disabled}
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ""))}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          aria-label="Quantidade de pessoas"
          className="w-28 mx-auto block text-center text-5xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums bg-transparent border-0 border-b border-indigo-200/70 dark:border-indigo-500/40 focus:border-indigo-500 focus:ring-0 outline-none px-1 py-0.5"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">pessoas</p>
      </div>
      <input
        type="range"
        min={PEOPLE_MIN}
        max={PEOPLE_MAX}
        step={PEOPLE_STEP}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-indigo-600 h-2 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{PEOPLE_MIN}</span>
        <span>passo {PEOPLE_STEP}</span>
        <span>{PEOPLE_MAX}</span>
      </div>
    </div>
  );
}
