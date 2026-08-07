import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import ActionMenu from "../../../../shared/components/ActionMenu";
import { StockBatch, StockBatchStatus } from "../../../../shared/services/stock/types";
import { formatDateBR } from "../../../../shared/utils/formatDate";

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface BatchCardProps {
  batches: StockBatch[];
  onViewDetails: (batch: StockBatch) => void;
  onEdit: (batch: StockBatch) => void;
  onDelete: (batch: StockBatch) => void;
}

export default function BatchCard({
  batches,
  onViewDetails,
  onEdit,
  onDelete,
}: BatchCardProps) {
  if (batches.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Nenhum lote encontrado.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {batches.map((batch) => (
        <div
          key={batch.id}
          className="p-4 flex items-start justify-between gap-3"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {batch.productName || batch.productId}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {batch.expiryDate
                ? `Val. ${formatDateBR(batch.expiryDate)}`
                : "Sem validade"}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span className="text-gray-700 dark:text-gray-300">
                {batch.availableQuantity.toLocaleString("pt-BR", {
                  maximumFractionDigits: 2,
                })}{" "}
                L
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                {formatCurrency(batch.availableQuantity * batch.unitValue)}
              </span>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  batch.status === StockBatchStatus.ACTIVE
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {batch.status === StockBatchStatus.ACTIVE
                  ? "Ativo"
                  : "Encerrado"}
              </span>
            </div>
          </div>
          <ActionMenu
            items={[
              {
                key: "details",
                label: "Detalhes",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => onViewDetails(batch),
              },
              {
                key: "edit",
                label: "Editar",
                icon: <Pencil className="h-4 w-4" />,
                onClick: () => onEdit(batch),
              },
              {
                key: "delete",
                label: "Excluir",
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => onDelete(batch),
                danger: true,
              },
            ]}
          />
        </div>
      ))}
    </div>
  );
}
