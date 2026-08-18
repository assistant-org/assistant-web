import React from "react";
import {
  TransactionType,
  PAYMENT_METHOD_LABELS,
} from "../../../../shared/services/transactions/types";
import { formatDateBR } from "../../../../shared/utils/formatDate";
import { ITransactionDetailsProps } from "../types";
import { TYPE_BADGE, VALUE_CLASSES, VALUE_SIGN, formatCurrency } from "./TransactionTable";

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <div className="mt-1 text-sm text-gray-900 dark:text-white">{children}</div>
  </div>
);

const TransactionDetails: React.FC<ITransactionDetailsProps> = ({
  transaction,
  getCategoryName,
  getAccountName,
  getEventName,
}) => {
  const badge = TYPE_BADGE[transaction.type];
  const isTransfer = transaction.type === TransactionType.TRANSFER;
  const eventName = getEventName(transaction.eventId);

  return (
    <div className="space-y-4">
      <Field label="Tipo">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
      </Field>

      <Field label="Data de criação">
        {formatDateBR(transaction.created_at)}
      </Field>

      <Field label="Data de transação">{formatDateBR(transaction.date)}</Field>

      {isTransfer ? (
        <>
          <Field label="De">{getAccountName(transaction.sourceAccountId)}</Field>
          <Field label="Para">{getAccountName(transaction.destinationAccountId)}</Field>
        </>
      ) : (
        <>
          <Field label="Categoria">{getCategoryName(transaction.categoryId)}</Field>
          <Field label={transaction.type === TransactionType.INCOME ? "Entrou em" : "Saiu de"}>
            {getAccountName(
              transaction.type === TransactionType.INCOME
                ? transaction.destinationAccountId
                : transaction.sourceAccountId,
            )}
          </Field>
        </>
      )}

      {!isTransfer && transaction.paymentMethod && (
        <Field label="Forma de Pagamento">
          {PAYMENT_METHOD_LABELS[transaction.paymentMethod] || transaction.paymentMethod}
        </Field>
      )}

      <Field label="Valor">
        <span className={`font-medium ${VALUE_CLASSES[transaction.type]}`}>
          {VALUE_SIGN[transaction.type]}
          {formatCurrency(transaction.value)}
        </span>
      </Field>

      {transaction.description && (
        <Field label="Descrição">{transaction.description}</Field>
      )}

      {!isTransfer && eventName && <Field label="Evento">{eventName}</Field>}
    </div>
  );
};

export default TransactionDetails;
