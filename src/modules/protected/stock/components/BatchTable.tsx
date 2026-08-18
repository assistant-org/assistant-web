import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import ActionMenu from "../../../../shared/components/ActionMenu";
import { StockBatch, StockBatchStatus } from "../../../../shared/services/stock/types";
import { formatDateBR } from "../../../../shared/utils/formatDate";

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface BatchTableProps {
  batches: StockBatch[];
  onViewDetails: (batch: StockBatch) => void;
  onEdit: (batch: StockBatch) => void;
  onDelete: (batch: StockBatch) => void;
}

export default function BatchTable({
  batches,
  onViewDetails,
  onEdit,
  onDelete,
}: BatchTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th className="px-6 py-3">Produto</th>
            <th className="px-6 py-3">Data de criação</th>
            <th className="px-6 py-3">Validade</th>
            <th className="px-6 py-3 text-right">Litros disponíveis</th>
            <th className="px-6 py-3 text-right">Valor</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {batches.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center">
                Nenhum lote encontrado.
              </td>
            </tr>
          ) : (
            batches.map((batch) => (
              <tr
                key={batch.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {batch.productName || batch.productId}
                </td>
                <td className="px-6 py-4">
                  {formatDateBR(batch.created_at)}
                </td>
                <td className="px-6 py-4">
                  {formatDateBR(batch.expiryDate)}
                </td>
                <td className="px-6 py-4 text-right">
                  {batch.availableQuantity.toLocaleString("pt-BR", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  L
                </td>
                <td className="px-6 py-4 text-right">
                  {formatCurrency(batch.availableQuantity * batch.unitValue)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      batch.status === StockBatchStatus.ACTIVE
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {batch.status === StockBatchStatus.ACTIVE
                      ? "Ativo"
                      : "Encerrado"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
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
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
