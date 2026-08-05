import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { TransactionType, TransactionStatus } from "../../../../shared/services/transactions/types";
import { formatDateBR } from "../../../../shared/utils/formatDate";
import { ITransactionListProps } from "../types";
import { TYPE_BADGE, VALUE_CLASSES, VALUE_SIGN, formatCurrency } from "./TransactionTable";

const TransactionCard: React.FC<ITransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onViewDetails,
  getCategoryName,
  getAccountName,
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
          <button
            key={transaction.id}
            type="button"
            onClick={() => onViewDetails(transaction)}
            className={`w-full text-left px-4 py-4 active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors ${
              isCancelled ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                  {isCancelled && (
                    <span className="text-xs text-gray-400 italic">Cancelada</span>
                  )}
                </div>
                <p className="mt-1.5 text-sm font-medium text-gray-900 dark:text-white truncate">
                  {description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatDateBR(transaction.date)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={`text-base font-semibold ${VALUE_CLASSES[transaction.type]} ${
                    isCancelled ? "line-through" : ""
                  }`}
                >
                  {VALUE_SIGN[transaction.type]}
                  {formatCurrency(transaction.value)}
                </span>
                <div
                  className="flex items-center gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onEdit(transaction)}
                    className="text-indigo-600 hover:text-indigo-800 dark:text-zinc-400 dark:hover:text-white p-1 -m-1"
                    aria-label="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(transaction.id)}
                    className="text-red-600 hover:text-red-800 dark:text-zinc-400 dark:hover:text-white p-1 -m-1"
                    aria-label="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Eye className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default TransactionCard;
