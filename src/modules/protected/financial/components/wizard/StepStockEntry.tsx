import React, { useEffect, useMemo } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import Input from "../../../../../shared/components/Input";
import Select from "../../../../../shared/components/Select";
import MoneyInput from "../../../../../shared/components/MoneyInput";
import { Product } from "../../../../../shared/services/products/types";
import { TransactionFormValues } from "../../types";

interface StepStockEntryProps {
  formMethods: UseFormReturn<TransactionFormValues>;
  products: Product[];
  isLoading: boolean;
}

export default function StepStockEntry({
  formMethods,
  products,
  isLoading,
}: StepStockEntryProps) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = formMethods;

  const liters = watch("stockQuantityLiters") || 0;
  const unitValue = watch("stockUnitValue") || 0;
  const total = liters * unitValue;

  const activeProducts = useMemo(
    () => products.filter((p) => p.active && p.trackStock),
    [products],
  );

  useEffect(() => {
    if (liters > 0 && unitValue >= 0) {
      setValue("value", Number((liters * unitValue).toFixed(2)), {
        shouldValidate: true,
      });
    }
  }, [liters, unitValue, setValue]);

  return (
    <div className="grid grid-cols-1 gap-5">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Esta despesa é uma Compra de Chopp. Informe o lote que será criado no estoque.
      </p>
      <Select
        id="stockProductId"
        label="Produto"
        register={register("stockProductId")}
        error={errors.stockProductId?.message}
        disabled={isLoading}
        options={activeProducts}
        optionName="name"
        optionId="id"
      />
      <Input
        id="stockQuantityLiters"
        label="Quantidade (litros)"
        type="number"
        step="any"
        register={register("stockQuantityLiters", { valueAsNumber: true })}
        error={errors.stockQuantityLiters?.message}
        disabled={isLoading}
      />
      <Controller
        name="stockUnitValue"
        control={control}
        render={({ field }) => (
          <MoneyInput
            id="stockUnitValue"
            label="Valor por litro"
            value={field.value ?? 0}
            onChange={field.onChange}
            error={errors.stockUnitValue?.message}
            disabled={isLoading}
          />
        )}
      />
      <Input
        id="stockExpiryDate"
        label="Validade (opcional)"
        type="date"
        register={register("stockExpiryDate")}
        disabled={isLoading}
      />
      <div className="rounded-md bg-gray-50 dark:bg-gray-800/60 px-3 py-2 text-sm">
        <span className="text-gray-500">Valor da despesa (calculado): </span>
        <span className="font-semibold text-gray-900 dark:text-white">
          {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
      </div>
    </div>
  );
}
