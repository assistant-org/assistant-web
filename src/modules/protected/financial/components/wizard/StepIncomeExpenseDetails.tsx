import React, { useMemo } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import Input from "../../../../../shared/components/Input";
import MoneyInput from "../../../../../shared/components/MoneyInput";
import Select from "../../../../../shared/components/Select";
import { TransactionType } from "../../../../../shared/services/transactions/types";
import { Category } from "../../../../../shared/services/categories/types";
import { CategoryType } from "../../../categories/types";
import { TransactionFormValues } from "../../types";

interface StepIncomeExpenseDetailsProps {
  formMethods: UseFormReturn<TransactionFormValues>;
  type: TransactionType;
  categories: Category[];
  isLoading: boolean;
}

export default function StepIncomeExpenseDetails({
  formMethods,
  type,
  categories,
  isLoading,
}: StepIncomeExpenseDetailsProps) {
  const {
    register,
    control,
    formState: { errors },
  } = formMethods;

  const isIncome = type === TransactionType.INCOME;

  const filteredCategories = useMemo(() => {
    const wanted = isIncome ? CategoryType.INCOME : CategoryType.EXPENSE;
    return categories.filter((c) => c.type === wanted);
  }, [categories, isIncome]);

  return (
    <div className="grid grid-cols-1 gap-5">
      <Controller
        name="value"
        control={control}
        render={({ field }) => (
          <MoneyInput
            id="value"
            label="Valor"
            value={field.value}
            onChange={field.onChange}
            error={errors.value?.message}
            disabled={isLoading}
          />
        )}
      />
      <Input
        id="date"
        label="Data"
        type="date"
        register={register("date")}
        error={errors.date?.message}
        disabled={isLoading}
      />
      <Select
        id="categoryId"
        label="Categoria"
        register={register("categoryId")}
        error={errors.categoryId?.message}
        disabled={isLoading}
        options={filteredCategories}
        optionName="name"
        optionId="id"
      />
    </div>
  );
}
