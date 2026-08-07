import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import ActionMenu from "../../../../shared/components/ActionMenu";
import {
  TransactionStatus,
} from "../../../../shared/services/transactions/types";
import { formatDateBR } from "../../../../shared/utils/formatDate";
import { ITransactionListProps } from "../types";
import {
  TYPE_BADGE,
  VALUE_CLASSES,
  VALUE_SIGN,
  formatCurrency,
} from "./TransactionTable";

const TransactionCard: React.FC<ITransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onViewDetails,
  getCategoryName,
}) => {
  if (transactions.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-gray-400 text-sm">
        Nenhuma movimentação encontrada.
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
      {transactions.map((transaction) => {
        const badge = TYPE_BADGE[transaction.type];
        const isCancelled = transaction.status === TransactionStatus.CANCELLED;
        const description =
          transaction.category || getCategoryName(transaction.categoryId);

        return (
          <div
            key={transaction.id}
            className={`w-full px-4 py-4 ${isCancelled ? "opacity-50" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => onViewDetails(transaction)}
                className="min-w-0 flex-1 text-left active:bg-gray-50 dark:active:bg-gray-700/50 rounded-md -m-1 p-1"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                  {isCancelled && (
                    <span className="text-xs text-gray-400 italic">
                      Cancelada
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm font-medium text-gray-900 dark:text-white truncate">
                  {description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatDateBR(transaction.date)}
                </p>
              </button>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={`text-base font-semibold ${VALUE_CLASSES[transaction.type]} ${
                    isCancelled ? "line-through" : ""
                  }`}
                >
                  {VALUE_SIGN[transaction.type]}
                  {formatCurrency(transaction.value)}
                </span>
                <ActionMenu
                  items={[
                    {
                      key: "details",
                      label: "Detalhes",
                      icon: <Eye className="h-4 w-4" />,
                      onClick: () => onViewDetails(transaction),
                    },
                    {
                      key: "edit",
                      label: "Editar",
                      icon: <Pencil className="h-4 w-4" />,
                      onClick: () => onEdit(transaction),
                    },
                    {
                      key: "delete",
                      label: "Excluir",
                      icon: <Trash2 className="h-4 w-4" />,
                      onClick: () => onDelete(transaction.id),
                      danger: true,
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionCard;
