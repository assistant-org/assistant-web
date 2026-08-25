import React from "react";
import Input from "../../../../shared/components/Input";
import { UseFormReturn } from "react-hook-form";
import { formatPhoneBR } from "../../../../shared/services/budgets/format";
import { BudgetFormValues } from "../../../../shared/services/budgets/schema";

interface StepClientProps {
  formMethods: UseFormReturn<BudgetFormValues>;
  showEventDate?: boolean;
  disabled?: boolean;
}

export default function StepClient({
  formMethods,
  showEventDate = false,
  disabled,
}: StepClientProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = formMethods;

  const phone = watch("clientPhone") || "";

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
      <div>
        <label
          htmlFor="clientPhone"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Telefone (opcional)
        </label>
        <input
          id="clientPhone"
          type="tel"
          inputMode="numeric"
          disabled={disabled}
          placeholder="(11) 99999-9999"
          value={phone}
          onChange={(e) =>
            setValue("clientPhone", formatPhoneBR(e.target.value), {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 ${
            errors.clientPhone
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />
        {errors.clientPhone?.message ? (
          <p className="mt-1 text-sm text-red-500">{errors.clientPhone.message}</p>
        ) : null}
      </div>
      {showEventDate ? (
        <Input
          label="Data do evento"
          id="eventDate"
          type="date"
          disabled={disabled}
          error={errors.eventDate?.message}
          register={register("eventDate", {
            required: "Data do evento obrigatória",
          })}
        />
      ) : null}
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
