import React from "react";
import { UseFormReturn } from "react-hook-form";
import Select from "../../../../../shared/components/Select";
import { PaymentMethod } from "../../../../../shared/services/transactions/types";
import { IEventOption, TransactionFormValues } from "../../types";

const PAYMENT_METHOD_OPTIONS = [
  { id: PaymentMethod.MONEY, name: "Dinheiro" },
  { id: PaymentMethod.PIX, name: "Pix" },
  { id: PaymentMethod.DEBIT_CARD, name: "Cartão de Débito" },
  { id: PaymentMethod.CREDIT_CARD, name: "Cartão de Crédito" },
];

interface StepIncomeExpenseExtrasProps {
  formMethods: UseFormReturn<TransactionFormValues>;
  isLoading: boolean;
  events: IEventOption[];
  eventsEnabled: boolean;
}

export default function StepIncomeExpenseExtras({
  formMethods,
  isLoading,
  events,
  eventsEnabled,
}: StepIncomeExpenseExtrasProps) {
  const {
    register,
    formState: { errors },
  } = formMethods;

  return (
    <div className="grid grid-cols-1 gap-5">
      <Select
        id="paymentMethod"
        label="Forma de Pagamento (Opcional)"
        register={register("paymentMethod")}
        error={errors.paymentMethod?.message}
        disabled={isLoading}
        options={PAYMENT_METHOD_OPTIONS}
        optionName="name"
        optionId="id"
        placeholder="Selecione uma forma de pagamento..."
      />
      {eventsEnabled && (
        <Select
          id="eventId"
          label="Evento Relacionado (Opcional)"
          register={register("eventId")}
          error={errors.eventId?.message}
          disabled={isLoading}
          options={events}
          optionName="name"
          optionId="id"
          placeholder="Selecione um evento..."
        />
      )}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Descrição (Opcional)
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
