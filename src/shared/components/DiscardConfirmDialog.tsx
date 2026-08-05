import React from "react";
import Button from "./Button";

interface DiscardConfirmDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export default function DiscardConfirmDialog({
  isOpen,
  onCancel,
  onConfirm,
  title = "Cancelar cadastro?",
  message = "Deseja realmente cancelar este cadastro? Todas as informações preenchidas serão perdidas.",
}: DiscardConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Continuar editando
          </Button>
          <Button type="button" onClick={onConfirm} className="!bg-red-600 hover:!bg-red-700">
            Cancelar cadastro
          </Button>
        </div>
      </div>
    </div>
  );
}
