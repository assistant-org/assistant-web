import React from "react";
import { UseFormReturn } from "react-hook-form";
import Input from "../../../../../shared/components/Input";
import { StockFormValues } from "../../schema";

interface StepEntryMetaProps {
  formMethods: UseFormReturn<StockFormValues>;
  isLoading: boolean;
}

export default function StepEntryMeta({ formMethods, isLoading }: StepEntryMetaProps) {
  const {
    register,
    formState: { errors },
  } = formMethods;

  return (
    <div className="grid grid-cols-1 gap-5">
      <Input
        id="entryDate"
        label="Data da compra"
        type="date"
        register={register("entryDate")}
        error={errors.entryDate?.message}
        disabled={isLoading}
      />
      <Input
        id="expiryDate"
        label="Data de validade (opcional)"
        type="date"
        register={register("expiryDate")}
        disabled={isLoading}
      />
      <div>
        <label
          htmlFor="observations"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Descrição (opcional)
        </label>
        <textarea
          id="observations"
          {...register("observations")}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
