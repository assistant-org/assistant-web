import React from "react";
import Input from "../../../../shared/components/Input";
import { UseFormReturn } from "react-hook-form";
import { BudgetFormValues } from "../../../../shared/services/budgets/schema";

interface StepClientProps {
  formMethods: UseFormReturn<BudgetFormValues>;
  disabled?: boolean;
}

export default function StepClient({ formMethods, disabled }: StepClientProps) {
  const {
    register,
    formState: { errors },
  } = formMethods;

  return (
    <div className="space-y-4">
      <Input
        label="Nome"
        id="clientName"
        type="text"
        disabled={disabled}
        error={errors.clientName?.message}
        register={register("clientName")}
      />
      <Input
        label="Telefone"
        id="clientPhone"
        type="tel"
        placeholder="(11) 99999-9999"
        disabled={disabled}
        error={errors.clientPhone?.message}
        register={register("clientPhone")}
      />
      <Input
        label="Cidade"
        id="clientCity"
        type="text"
        disabled={disabled}
        error={errors.clientCity?.message}
        register={register("clientCity")}
      />
      <Input
        label="Data do evento"
        id="eventDate"
        type="date"
        disabled={disabled}
        error={errors.eventDate?.message}
        register={register("eventDate")}
      />
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Observações
        </label>
        <textarea
          id="notes"
          rows={3}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
          {...register("notes")}
        />
      </div>
    </div>
  );
}
