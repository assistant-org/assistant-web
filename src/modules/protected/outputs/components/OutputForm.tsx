import React from "react";
// import { useWatch } from "react-hook-form";
import { Controller } from "react-hook-form";
import { IOutputFormProps, PaymentMethod } from "../types";
import Input from "../../../../shared/components/Input";
import MoneyInput from "../../../../shared/components/MoneyInput";
import Select from "../../../../shared/components/Select";
import Button from "../../../../shared/components/Button";
import { ClipLoader } from "react-spinners";

export default function OutputForm({
  formMethods,
  onSave,
  onCancel,
  isLoading,
  categories,
  events,
}: IOutputFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = formMethods;

  // const isRecurring = useWatch({ control, name: 'isRecurring' });
  console.log(formMethods.getValues("value"));

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
              onChange={(formatted) => {
                field.onChange(formatted);
              }}
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
          id="paymentMethod"
          label="Forma de Pagamento"
          register={register("paymentMethod")}
          error={errors.paymentMethod?.message}
          disabled={isLoading}
          options={[
            { id: PaymentMethod.MONEY, name: "Dinheiro" },
            { id: PaymentMethod.PIX, name: "Pix" },
            { id: PaymentMethod.DEBIT_CARD, name: "Cartão de Débito" },
            { id: PaymentMethod.CREDIT_CARD, name: "Cartão de Crédito" },
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
            disabled={isLoading}
          ></textarea>
        </div>
        <div className="md:col-span-2">
          <Select
            id="event"
            label="Evento (opcional)"
            register={register("event")}
            error={errors.event?.message}
            disabled={isLoading}
            options={events}
            optionName="name"
            optionId="id"
          />
        </div>
        <div className="md:col-span-2 flex items-start space-x-4">
          {/* <div className="flex h-6 items-center">
            <input
              id="isRecurring"
              type="checkbox"
              {...register("isRecurring")}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              disabled={isLoading}
            />
          </div>
          <div className="text-sm">
            <label
              htmlFor="isRecurring"
              className="font-medium text-gray-900 dark:text-gray-200"
            >
              Despesa Fixa?
            </label>
            <p className="text-gray-500 dark:text-gray-400">
              Marque se esta for uma despesa recorrente (ex: aluguel, salários).
            </p>
          </div> */}
        </div>

        {/* {isRecurring && (
          <Input
            id="recurrenceDay"
            label="Dia da Recorrência Mensal"
            type="number"
            min="1"
            max="31"
            register={register("recurrenceDay", { valueAsNumber: true })}
            error={errors.recurrenceDay?.message}
            disabled={isLoading}
          />
        )} */}
      </div>

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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <ClipLoader size={20} color="#ffffff" /> : "Salvar"}
          </Button>
        </div>
      </div>
    </form>
  );
}
