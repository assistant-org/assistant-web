import React, { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import Input from "../../../../../shared/components/Input";
import Select from "../../../../../shared/components/Select";
import { Product } from "../../../../../shared/services/products/types";
import {
  StockBatch,
  StockBatchStatus,
} from "../../../../../shared/services/stock/types";
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
    })} L${b.expiryDate ? ` · val. ${new Date(b.expiryDate).toLocaleDateString("pt-BR")}` : ""}`,
  }));

  return (
    <div className="grid grid-cols-1 gap-5">
      <Select
        id="productId"
        label="Produto"
        register={register("productId", {
          onChange: () => setValue("batchId", null),
        })}
        error={errors.productId?.message}
        disabled={isLoading}
        options={activeProducts}
        optionName="name"
        optionId="id"
      />
      <Select
        id="batchId"
        label="Lote"
        register={register("batchId")}
        error={errors.batchId?.message}
        disabled={isLoading || !productId}
        options={batchOptions}
        optionName="name"
        optionId="id"
        placeholder={!productId ? "Selecione um produto primeiro" : "Selecione um lote"}
      />
      <Input
        id="quantity"
        label="Quantidade (litros)"
        type="number"
        step="any"
        register={register("quantity", { valueAsNumber: true })}
        error={errors.quantity?.message}
        disabled={isLoading}
      />
    </div>
  );
}
