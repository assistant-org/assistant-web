import React from "react";
import { UseFormReturn } from "react-hook-form";
import Input from "../../../../../shared/components/Input";
import { StockMovementType } from "../../../../../shared/services/stock/types";
import { movementRequiresJustification } from "../../../../../shared/services/stock/schema";
import { StockFormValues } from "../../schema";

interface StepOutgoingMetaProps {
  formMethods: UseFormReturn<StockFormValues>;
  type: StockMovementType;
  isLoading: boolean;
}

export default function StepOutgoingMeta({
  formMethods,
  type,
  isLoading,
}: StepOutgoingMetaProps) {
  const {
    register,
    formState: { errors },
  } = formMethods;

  const requiresJustification = movementRequiresJustification(type);

  return (
    <div className="grid grid-cols-1 gap-5">
      <Input
        id="date"
        label="Data"
        type="date"
        register={register("date")}
        error={errors.date?.message}
        disabled={isLoading}
      />
      <div>
        <label
          htmlFor="reason"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {requiresJustification ? "Justificativa" : "Descrição (opcional)"}
        </label>
        <textarea
          id="reason"
          {...register("reason")}
          rows={3}
          className={`mt-1 block w-full rounded-md border shadow-sm focus:ring-indigo-500 sm:text-sm px-3 py-2 ${
            errors.reason
              ? "border-red-500 dark:bg-gray-700 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-indigo-500"
          }`}
          disabled={isLoading}
        />
        {errors.reason?.message ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.reason.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
