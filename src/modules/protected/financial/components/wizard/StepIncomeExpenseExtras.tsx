import React from "react";
import { UseFormReturn } from "react-hook-form";
import Select from "../../../../../shared/components/Select";
import {
  PaymentMethod,
  PAYMENT_METHOD_LABELS,
  TransactionType,
} from "../../../../../shared/services/transactions/types";
import { IEventOption, TransactionFormValues } from "../../types";

const PAYMENT_METHOD_OPTIONS = Object.values(PaymentMethod).map((id) => ({
  id,
  name: PAYMENT_METHOD_LABELS[id],
}));

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
    control,
    watch,
    formState: { errors },
  } = formMethods;

  const type = watch("type");
  const paymentLabel =
    type === TransactionType.INCOME
      ? "Forma de Pagamento (Opcional)"
      : "Forma de Pagamento";

  return (
    <div className="grid grid-cols-1 gap-5">
      <Select
        id="paymentMethod"
        name="paymentMethod"
        control={control}
        label={paymentLabel}
        error={errors.paymentMethod?.message}
        disabled={isLoading}
        options={PAYMENT_METHOD_OPTIONS}
        optionName="name"
        optionId="id"
      />
      {eventsEnabled && (
        <Select
          id="eventId"
          name="eventId"
          control={control}
          label="Evento Relacionado (Opcional)"
          error={errors.eventId?.message}
          disabled={isLoading}
          options={events}
          optionName="name"
          optionId="id"
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
