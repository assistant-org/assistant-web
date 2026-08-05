import React from "react";

interface WizardProgressProps {
  currentIndex: number;
  total: number;
}

export default function WizardProgress({ currentIndex, total }: WizardProgressProps) {
  const percent = total > 1 ? (currentIndex / (total - 1)) * 100 : 100;

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
        Passo {currentIndex + 1} de {total}
      </p>
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
