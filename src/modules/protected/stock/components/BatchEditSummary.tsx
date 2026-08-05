import React, { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import Button from "../../../../shared/components/Button";
import FormShell from "../../../../shared/components/FormShell";
import MoneyInput from "../../../../shared/components/MoneyInput";
import { StockBatch } from "../../../../shared/services/stock/types";
import { formatDateBR } from "../../../../shared/utils/formatDate";

type EditSection = "summary" | "expiryDate" | "unitValue" | "observations";

export interface BatchEditValues {
  expiryDate: string | null;
  unitValue: number;
  observations: string | null;
}

interface BatchEditSummaryProps {
  isOpen: boolean;
  batch: StockBatch;
  onClose: () => void;
  onSave: (updates: BatchEditValues) => void;
  onDelete: () => void;
  isLoading?: boolean;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const inputClass =
  "mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-indigo-500";

export default function BatchEditSummary({
  isOpen,
  batch,
  onClose,
  onSave,
  onDelete,
  isLoading,
}: BatchEditSummaryProps) {
  const [section, setSection] = useState<EditSection>("summary");
  const [expiryDate, setExpiryDate] = useState(batch.expiryDate || "");
  const [unitValue, setUnitValue] = useState(batch.unitValue);
  const [observations, setObservations] = useState(batch.observations || "");

  useEffect(() => {
    if (!isOpen) return;
    setSection("summary");
    setExpiryDate(batch.expiryDate || "");
    setUnitValue(batch.unitValue);
    setObservations(batch.observations || "");
  }, [isOpen, batch]);

  const handleSave = () => {
    onSave({
      expiryDate: expiryDate || null,
      unitValue,
      observations: observations.trim() || null,
    });
  };

  const title =
    section === "summary"
      ? "Editar lote"
      : section === "expiryDate"
        ? "Editar validade"
        : section === "unitValue"
          ? "Editar valor unitário"
          : "Editar observações";

  const renderBody = () => {
    if (section === "expiryDate") {
      return (
        <div>
          <label
            htmlFor="batch-expiry"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Data de validade
          </label>
          <input
            id="batch-expiry"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className={inputClass}
          />
        </div>
      );
    }
    if (section === "unitValue") {
      return (
        <MoneyInput
          id="batch-unitValue"
          label="Valor"
          value={unitValue}
          onChange={setUnitValue}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Valor unitário por litro (R$/L)
        </p>
      );
    }
    if (section === "observations") {
      return (
        <div>
          <label
            htmlFor="batch-observations"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Observações
          </label>
          <textarea
            id="batch-observations"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={4}
            className={inputClass}
            placeholder="Opcional"
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Confira os dados antes de salvar. Clique no lápis para corrigir qualquer
          informação.
        </p>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Produto
          </h4>
          <dl className="space-y-1.5">
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">Nome</dt>
              <dd className="text-gray-900 dark:text-white font-medium text-right">
                {batch.productName || batch.productId}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">Lote</dt>
              <dd className="text-gray-900 dark:text-white font-medium text-right">
                #{batch.id}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Validade
            </h4>
            <button
              type="button"
              onClick={() => setSection("expiryDate")}
              className="text-indigo-600 hover:text-indigo-800 dark:text-zinc-400 dark:hover:text-white p-1 -m-1"
              aria-label="Editar validade"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          <dl className="space-y-1.5">
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">Data</dt>
              <dd className="text-gray-900 dark:text-white font-medium text-right">
                {formatDateBR(expiryDate || null)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Valor
            </h4>
            <button
              type="button"
              onClick={() => setSection("unitValue")}
              className="text-indigo-600 hover:text-indigo-800 dark:text-zinc-400 dark:hover:text-white p-1 -m-1"
              aria-label="Editar valor unitário"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          <dl className="space-y-1.5">
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">Valor unitário</dt>
              <dd className="text-gray-900 dark:text-white font-medium text-right">
                {formatCurrency(unitValue)}/L
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Observações
            </h4>
            <button
              type="button"
              onClick={() => setSection("observations")}
              className="text-indigo-600 hover:text-indigo-800 dark:text-zinc-400 dark:hover:text-white p-1 -m-1"
              aria-label="Editar observações"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          <dl className="space-y-1.5">
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">Texto</dt>
              <dd className="text-gray-900 dark:text-white font-medium text-right whitespace-pre-wrap">
                {observations.trim() || "-"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    );
  };

  return (
    <FormShell
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      requireConfirmClose={section === "summary"}
      footer={({ requestClose }) =>
        section === "summary" ? (
          <div className="flex justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onDelete}
              disabled={isLoading}
              className="!text-red-600 !border-red-300 hover:!bg-red-50 dark:hover:!bg-red-950/30"
            >
              Excluir
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={requestClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="button" isLoading={isLoading} onClick={handleSave}>
                Salvar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSection("summary")}
              disabled={isLoading}
            >
              Voltar
            </Button>
            <Button
              type="button"
              onClick={() => setSection("summary")}
              disabled={isLoading}
            >
              Revisar
            </Button>
          </div>
        )
      }
    >
      {renderBody()}
    </FormShell>
  );
}
