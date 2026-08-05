import React, { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import Input from "../../../../../shared/components/Input";
import Select from "../../../../../shared/components/Select";
import { Product } from "../../../../../shared/services/products/types";
import {
  StockBatch,
  StockBatchStatus,
} from "../../../../../shared/services/stock/types";
import { formatDateBR } from "../../../../../shared/utils/formatDate";
import { StockFormValues } from "../../schema";

interface StepOutgoingDetailsProps {
  formMethods: UseFormReturn<StockFormValues>;
  products: Product[];
  batches: StockBatch[];
  isLoading: boolean;
}

export default function StepOutgoingDetails({
  formMethods,
  products,
  batches,
  isLoading,
}: StepOutgoingDetailsProps) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = formMethods;

  const productId = watch("productId");
  const activeProducts = useMemo(() => products.filter((p) => p.active), [products]);
  const productBatches = useMemo(
    () =>
      batches.filter(
        (b) => b.productId === productId && b.status === StockBatchStatus.ACTIVE,
      ),
    [batches, productId],
  );

  const batchOptions = productBatches.map((b) => ({
    id: b.id,
    name: `Lote #${b.id} · ${b.availableQuantity.toLocaleString("pt-BR", {
      maximumFractionDigits: 2,
    })} L${b.expiryDate ? ` · val. ${formatDateBR(b.expiryDate)}` : ""}`,
  }));

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
        onValueChange={() => setValue("batchId", null)}
      />
      <Select
        id="batchId"
        name="batchId"
        control={control}
        label="Lote"
        error={errors.batchId?.message}
        disabled={isLoading || !productId}
        options={batchOptions}
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
    </div>
  );
}
