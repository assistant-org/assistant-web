import React from "react";

interface WizardProgressProps {
  currentIndex: number;
  total: number;
  title: string;
}

export default function WizardProgress({
  currentIndex,
  total,
  title,
}: WizardProgressProps) {
  const percent = total > 1 ? (currentIndex / (total - 1)) * 100 : 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Passo {currentIndex + 1} de {total}
        </p>
        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          {title}
        </p>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
