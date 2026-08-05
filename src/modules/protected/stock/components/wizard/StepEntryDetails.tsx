import React, { useMemo } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import Input from "../../../../../shared/components/Input";
import Select from "../../../../../shared/components/Select";
import MoneyInput from "../../../../../shared/components/MoneyInput";
import { Product } from "../../../../../shared/services/products/types";
import { StockFormValues } from "../../schema";

interface StepEntryDetailsProps {
  formMethods: UseFormReturn<StockFormValues>;
  products: Product[];
  isLoading: boolean;
}

export default function StepEntryDetails({
  formMethods,
  products,
  isLoading,
}: StepEntryDetailsProps) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = formMethods;

  const quantity = watch("quantity") || 0;
  const unitValue = watch("unitValue") || 0;
  const total = quantity * unitValue;

  const activeProducts = useMemo(
    () => products.filter((p) => p.active),
    [products],
  );

  return (
    <div className="grid grid-cols-1 gap-5">
      <Select
        id="productId"
        name="productId"
        control={control}
        label="Produto"
        error={errors.productId?.message}
        disabled={isLoading}
        options={activeProducts}
        optionName="name"
        optionId="id"
      />
      <Input
        id="quantity"
        label="Quantidade (litros)"
        type="text"
        inputMode="decimal"
        register={register("quantity", {
          setValueAs: (v) => {
            if (v === "" || v == null) return NaN;
            const n = Number(String(v).replace(",", "."));
            return Number.isFinite(n) ? n : NaN;
          },
        })}
        error={errors.quantity?.message}
        disabled={isLoading}
        placeholder="0"
      />
      <Controller
        name="unitValue"
        control={control}
        render={({ field }) => (
          <MoneyInput
            id="unitValue"
            label="Valor"
            value={field.value}
            onChange={field.onChange}
            error={errors.unitValue?.message}
            disabled={isLoading}
          />
        )}
      />
      <p className="-mt-3 text-xs text-gray-500 dark:text-gray-400">
        Valor por litro (R$/L)
      </p>
      <div className="rounded-md bg-gray-50 dark:bg-gray-800/60 px-3 py-2 text-sm">
        <span className="text-gray-500 dark:text-gray-400">Valor total do lote: </span>
        <span className="font-semibold text-gray-900 dark:text-white">
          {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
      </div>
    </div>
  );
}
