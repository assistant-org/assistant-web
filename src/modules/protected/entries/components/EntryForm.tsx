import React from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { IEntryFormProps, EventType, PaymentMethod } from "../types";
import Input from "../../../../shared/components/Input";
import MoneyInput from "../../../../shared/components/MoneyInput";
import Select from "../../../../shared/components/Select";
import Button from "../../../../shared/components/Button";

export default function EntryForm({
  formMethods,
  onSave,
  onCancel,
  isLoading,
  availableStockItems,
  categories = [],
  events = [],
}: IEntryFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "beerControl",
  });

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          id="category"
          label="Categoria"
          register={register("category")}
          error={errors.category?.message}
          disabled={isLoading}
          options={categories}
          optionName="name"
          optionId="id"
        />
        <Select
          id="event"
          label="Evento Relacionado (Opcional)"
          register={register("event")}
          error={errors.event?.message}
          disabled={isLoading}
          options={events}
          optionName="name"
          optionId="id"
          placeholder="Selecione um evento..."
        />
        <Select
          id="eventType"
          label="Tipo de Evento"
          register={register("eventType")}
          error={errors.eventType?.message}
          disabled={isLoading}
          options={[
            { id: EventType.CLOSED, name: "Evento Fechado" },
            { id: EventType.SINGLE, name: "Evento Avulso" },
          ]}
          optionName="name"
          optionId="id"
        />
        <Select
          id="paymentMethod"
          label="Forma de Pagamento (Opcional)"
          register={register("paymentMethod")}
          error={errors.paymentMethod?.message}
          disabled={isLoading}
          options={[
            { id: "", name: "Selecione uma forma de pagamento..." },
            { id: PaymentMethod.CASH, name: "Dinheiro" },
            { id: PaymentMethod.PIX, name: "Pix" },
            { id: PaymentMethod.CARD, name: "Cartão" },
          ]}
          optionName="name"
          optionId="id"
        />
        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Descrição
          </label>
          <textarea
            id="description"
            {...register("description")}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
          ></textarea>
        </div>
      </div>

      {/* {eventType === EventType.SINGLE && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Controle de Chopp no Evento</h4>
            {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-10 gap-4 items-end mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="col-span-4">
                        <Select id={`stockItemId-${index}`} label="Lote de Chopp" register={register(`beerControl.${index}.stockItemId`)} error={errors.beerControl?.[index]?.stockItemId?.message} options={availableStockItems.map(item => {
                            const expiryDate = new Date(item.expiryDate).toLocaleDateString('pt-BR');
                            return {
                              id: item.id,
                              name: `${item.productName} | Val: ${expiryDate} | Disp: ${item.availableQuantityLiters}L`
                            };
                          })} optionName="name" optionId="id" placeholder="Selecione um lote..." />
                        </Select>
                    </div>
                     <div className="col-span-2"><Input id={`taken-${index}`} label="Qtd. Levada (L)" type="number" register={register(`beerControl.${index}.quantityTaken`, { valueAsNumber: true })} error={errors.beerControl?.[index]?.quantityTaken?.message} /></div>
                     <div className="col-span-2"><Input id={`returned-${index}`} label="Qtd. Retornada (L)" type="number" register={register(`beerControl.${index}.quantityReturned`, { valueAsNumber: true })} error={errors.beerControl?.[index]?.quantityReturned?.message} /></div>
                    <div className="col-span-2"><Button type="button" variant="secondary" onClick={() => remove(index)}>Remover</Button></div>
                </div>
            ))}
            <Button type="button" variant="secondary" onClick={() => append({ stockItemId: '', quantityTaken: 0, quantityReturned: 0 })}>+ Adicionar Chopp</Button>
        </div>
      )} */}

      <div className="mt-8 pt-5">
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Salvar
          </Button>
        </div>
      </div>
    </form>
  );
}
