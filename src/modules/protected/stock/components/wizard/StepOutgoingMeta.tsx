import React from "react";
import { UseFormReturn } from "react-hook-form";
import Input from "../../../../../shared/components/Input";
import { StockFormValues } from "../../schema";

interface StepOutgoingMetaProps {
  formMethods: UseFormReturn<StockFormValues>;
  isLoading: boolean;
}

export default function StepOutgoingMeta({ formMethods, isLoading }: StepOutgoingMetaProps) {
  const {
    register,
    formState: { errors },
  } = formMethods;

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
          Descrição (opcional)
        </label>
        <textarea
          id="reason"
          {...register("reason")}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
