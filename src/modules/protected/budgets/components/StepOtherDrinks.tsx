import React from "react";
import Switch from "../../../../shared/components/Switch";

interface StepOtherDrinksProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export default function StepOtherDrinks({
  value,
  onChange,
  disabled,
}: StepOtherDrinksProps) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex items-start justify-between gap-4">
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Haverá outras bebidas?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Se sim, o consumo de chopp é reduzido em 20% no cálculo.
        </p>
      </div>
      <Switch checked={value} onChange={onChange} disabled={disabled} />
    </div>
  );
}
