import React, { useMemo, useState } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Input from "../../../../../shared/components/Input";
import Select from "../../../../../shared/components/Select";
import Button from "../../../../../shared/components/Button";
import { Product } from "../../../../../shared/services/products/types";
import {
  StockBatch,
  StockBatchStatus,
  StockMovementType,
} from "../../../../../shared/services/stock/types";
import { formatDateBR } from "../../../../../shared/utils/formatDate";
import { StockFormValues } from "../../schema";

interface IEventOption {
  id: string;
  name: string;
}

interface StepOperationProps {
  formMethods: UseFormReturn<StockFormValues>;
  products: Product[];
  batches: StockBatch[];
  events: IEventOption[];
  isLoading: boolean;
}

function itemSummary(
  item: StockFormValues["items"][number],
  products: Product[],
  batches: StockBatch[],
  isEntry: boolean,
): string {
  const product = products.find((p) => p.id === item.productId)?.name || "Produto";
  if (isEntry) {
    const money = Number(item.unitValue ?? 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return `${product} · ${item.quantity ?? 0} L · ${money}/L`;
  }
  const batch = batches.find((b) => b.id === item.batchId);
  const batchLabel = batch
    ? `Lote #${batch.id} (${batch.availableQuantity.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} L)`
    : "Lote";
  return `${product} · ${batchLabel} · ${item.quantity ?? 0} L`;
}

function isItemFilled(
  item: StockFormValues["items"][number] | undefined,
  isEntry: boolean,
): boolean {
  if (!item?.productId) return false;
  if (item.quantity == null || Number.isNaN(item.quantity) || item.quantity <= 0) {
    return false;
  }
  if (isEntry) return true;
  return Boolean(item.batchId);
}

export default function StepOperation({
  formMethods,
  products,
  batches,
  events,
  isLoading,
}: StepOperationProps) {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const type = watch("type");
  const mode = watch("mode");
  const isEntry = type === StockMovementType.ENTRY;
  const activeProducts = useMemo(() => products.filter((p) => p.active), [products]);

  const [editingIndex, setEditingIndex] = useState<number>(0);

  const batchOptionsFor = (productId?: string, eventId?: string | null) =>
    batches
      .filter(
        (b) =>
          b.productId === productId &&
          b.status === StockBatchStatus.ACTIVE &&
          (!eventId || b.eventId === eventId || !b.eventId),
      )
      .map((b) => ({
        id: b.id,
        name: `Lote #${b.id}${b.eventId ? ` · evt` : ""} · ${b.availableQuantity.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} L${
          b.expiryDate ? ` · val. ${formatDateBR(b.expiryDate)}` : ""
        }`,
      }));

  const addLine = () => {
    // Collapse previous line into card by switching edit index to new line
    append({
      productId: "",
      batchId: null,
      quantity: undefined as unknown as number,
      unitValue: isEntry ? 0 : null,
      availableQuantity: null,
    });
    setEditingIndex(fields.length);
  };

  const eventId = watch("eventId");
  const editingItem = watch(`items.${editingIndex}`);
  const canAddItem = isItemFilled(editingItem, isEntry);

  return (
    <div className="space-y-5">
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-800/60">
        {(["individual", "lote"] as const).map((m) => (
          <button
            key={m}
            type="button"
            disabled={isLoading}
            onClick={() => {
              setValue("mode", m);
              if (m === "individual" && fields.length > 1) {
                // keep first item only
                for (let i = fields.length - 1; i >= 1; i--) remove(i);
                setEditingIndex(0);
              }
            }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              mode === m
                ? "bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 shadow-sm"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {m === "individual" ? "Individual" : "Em lote"}
          </button>
        ))}
      </div>

      <Select
        id="eventId"
        name="eventId"
        control={control}
        label="Evento"
        error={errors.eventId?.message as string | undefined}
        disabled={isLoading}
        options={events}
        optionName="name"
        optionId="id"
        placeholder="Selecione o evento"
      />

      <div className="space-y-3">
        {fields.map((field, index) => {
          const isEditing = mode === "individual" || editingIndex === index;
          const item = watch(`items.${index}`);
          const productId = watch(`items.${index}.productId`);

          if (!isEditing) {
            return (
              <div
                key={field.id}
                className="relative rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3"
              >
                <button
                  type="button"
                  className="absolute top-2 right-2 text-indigo-600 dark:text-zinc-400 p-1"
                  onClick={() => setEditingIndex(index)}
                  aria-label="Editar item"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                {fields.length > 1 && (
                  <button
                    type="button"
                    className="absolute top-2 right-10 text-red-600 p-1"
                    onClick={() => {
                      remove(index);
                      setEditingIndex(Math.max(0, editingIndex - 1));
                    }}
                    aria-label="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <p className="text-sm font-medium text-gray-900 dark:text-white pr-16">
                  {itemSummary(item, products, batches, isEntry)}
                </p>
              </div>
            );
          }

          return (
            <div
              key={field.id}
              className={
                mode === "individual"
                  ? "space-y-4"
                  : "rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 space-y-4"
              }
            >
              {mode === "lote" && (
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                    Item {index + 1}
                  </p>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        remove(index);
                        setEditingIndex(Math.max(0, index - 1));
                      }}
                      className="text-red-600 p-1"
                      aria-label="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              <Select
                id={`items.${index}.productId`}
                name={`items.${index}.productId`}
                control={control}
                label="Produto"
                error={errors.items?.[index]?.productId?.message}
                disabled={isLoading}
                options={activeProducts}
                optionName="name"
                optionId="id"
                onValueChange={(id) => {
                  setValue(`items.${index}.batchId`, null);
                  setValue(`items.${index}.availableQuantity`, null);
                  if (isEntry && id) {
                    const product = products.find((p) => p.id === id);
                    setValue(
                      `items.${index}.unitValue`,
                      product?.defaultUnitValue ?? 0,
                    );
                  }
                }}
              />

              {!isEntry && (
                <Select
                  id={`items.${index}.batchId`}
                  name={`items.${index}.batchId`}
                  control={control}
                  label="Lote"
                  error={errors.items?.[index]?.batchId?.message}
                  disabled={isLoading || !productId}
                  options={batchOptionsFor(productId, eventId)}
                  optionName="name"
                  optionId="id"
                  onValueChange={(id) => {
                    const batch = batches.find((b) => b.id === id);
                    setValue(
                      `items.${index}.availableQuantity`,
                      batch?.availableQuantity ?? null,
                    );
                  }}
                />
              )}

              <Input
                id={`items.${index}.quantity`}
                label="Quantidade (litros)"
                type="text"
                inputMode="decimal"
                register={register(`items.${index}.quantity`, {
                  setValueAs: (v) => {
                    if (v === "" || v == null) return NaN;
                    const n = Number(String(v).replace(",", "."));
                    return Number.isFinite(n) ? n : NaN;
                  },
                })}
                error={errors.items?.[index]?.quantity?.message}
                disabled={isLoading}
                placeholder="0"
              />
            </div>
          );
        })}
      </div>

      {mode === "lote" && (
        <Button
          type="button"
          variant="secondary"
          onClick={addLine}
          disabled={isLoading || !canAddItem}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2 inline" />
          Adicionar item
        </Button>
      )}
    </div>
  );
}
