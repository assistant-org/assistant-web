import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import ActionMenu from "../../../../shared/components/ActionMenu";
import {
  TransactionType,
  TransactionStatus,
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
} from "../../../../shared/services/transactions/types";
import { formatDateBR } from "../../../../shared/utils/formatDate";
import { ITransactionListProps } from "../types";

const TYPE_BADGE: Record<TransactionType, { label: string; className: string }> = {
  [TransactionType.INCOME]: {
    label: "Receita",
    className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  },
  [TransactionType.EXPENSE]: {
    label: "Despesa",
    className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  },
  [TransactionType.TRANSFER]: {
    label: "Transferência",
    className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
};

const VALUE_CLASSES: Record<TransactionType, string> = {
  [TransactionType.INCOME]: "text-green-600 dark:text-green-400",
  [TransactionType.EXPENSE]: "text-red-600 dark:text-red-400",
  [TransactionType.TRANSFER]: "text-indigo-600 dark:text-indigo-400",
};

const VALUE_SIGN: Record<TransactionType, string> = {
  [TransactionType.INCOME]: "+",
  [TransactionType.EXPENSE]: "-",
  [TransactionType.TRANSFER]: "",
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const TransactionTable: React.FC<ITransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onViewDetails,
  getCategoryName,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              {" "}
            </th>
            <th scope="col" className="px-6 py-3">
              Data de transação
            </th>
            <th scope="col" className="px-6 py-3">
              Tipo
            </th>
            <th scope="col" className="px-6 py-3">
              Categoria / Conta
            </th>
            <th scope="col" className="px-6 py-3">
              Pgto
            </th>
            <th scope="col" className="px-6 py-3 text-right">
              Valor
            </th>
            <th scope="col" className="px-6 py-3">
              {" "}
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const badge = TYPE_BADGE[transaction.type];
            const isCancelled = transaction.status === TransactionStatus.CANCELLED;
            const description =
              transaction.category || getCategoryName(transaction.categoryId);

            return (
              <tr
                key={transaction.id}
                className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                  isCancelled ? "opacity-50" : ""
                }`}
              >
                <td className="px-6 py-4">
                  {formatDateBR(transaction.created_at)}
                </td>
                <td className="px-6 py-4">
                  {formatDateBR(transaction.date)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                  {isCancelled && (
                    <span className="ml-2 text-xs text-gray-400 italic">
                      Cancelada
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">{description}</td>
                <td className="px-6 py-4">
                  {transaction.paymentMethod
                    ? PAYMENT_METHOD_LABELS[
                        transaction.paymentMethod as PaymentMethod
                      ] || transaction.paymentMethod
                    : "-"}
                </td>
                <td
                  className={`px-6 py-4 text-right font-medium ${VALUE_CLASSES[transaction.type]} ${
                    isCancelled ? "line-through" : ""
                  }`}
                >
                  {VALUE_SIGN[transaction.type]}
                  {formatCurrency(transaction.value)}
                </td>
                <td className="px-6 py-4 text-center">
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
                </td>
              </tr>
            );
          })}
          {transactions.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                Nenhuma movimentação encontrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
export { TYPE_BADGE, VALUE_CLASSES, VALUE_SIGN, formatCurrency };
