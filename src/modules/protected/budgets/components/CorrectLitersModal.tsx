import React, { useEffect, useState } from "react";
import Button from "../../../../shared/components/Button";
import Modal from "../../../../shared/components/Modal";
import { formatLiters } from "../../../../shared/services/budgets/format";

interface CorrectLitersModalProps {
  isOpen: boolean;
  /** Current billing total (corrected or supplied). */
  initialLiters: number;
  onClose: () => void;
  onSave: (liters: number) => void;
}

export default function CorrectLitersModal({
  isOpen,
  initialLiters,
  onClose,
  onSave,
}: CorrectLitersModalProps) {
  const [liters, setLiters] = useState(initialLiters);

  useEffect(() => {
    if (!isOpen) return;
    setLiters(initialLiters);
  }, [isOpen, initialLiters]);

  const canSave = Number.isFinite(liters) && liters > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave(Math.round(liters * 100) / 100);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Corrigir quantidade">
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Informe o total de litros de chopp. A distribuição entre os sabores
          é feita automaticamente pelos percentuais já definidos.
        </p>

        <label className="block">
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quantidade (litros)
          </span>
          <input
            type="number"
            min={0.01}
            step={1}
            value={Number.isFinite(liters) ? liters : ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                setLiters(NaN);
                return;
              }
              const parsed = Number(raw.replace(",", "."));
              setLiters(Number.isFinite(parsed) ? parsed : NaN);
            }}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm tabular-nums"
          />
        </label>

        {canSave ? (
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            Total corrigido: {formatLiters(liters)}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={!canSave}>
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
