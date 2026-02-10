import React from "react";
// import { useWatch } from "react-hook-form";
import { IOutputFormProps, PaymentMethod } from "../types";
import Input from "../../../../shared/components/Input";
import Select from "../../../../shared/components/Select";
import Button from "../../../../shared/components/Button";
import { ClipLoader } from "react-spinners";

export default function OutputForm({
  formMethods,
  onSave,
  onCancel,
  isLoading,
  categories,
}: IOutputFormProps) {
  const {
    register,
    handleSubmit,
    // control,
    formState: { errors },
  } = formMethods;

  // const isRecurring = useWatch({ control, name: 'isRecurring' });

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="value"
          label="Valor"
          type="number"
          step="0.01"
          register={register("value", { valueAsNumber: true })}
          error={errors.value?.message}
          disabled={isLoading}
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
        >
          <option value="">Selecione...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </Select>
        <input type="hidden" {...register("type")} value="variavel" />
        <Select
          id="paymentMethod"
          label="Forma de Pagamento"
          register={register("paymentMethod")}
          error={errors.paymentMethod?.message}
          disabled={isLoading}
        >
          <option value="">Selecione...</option>
          <option value={PaymentMethod.MONEY}>Dinheiro</option>
          <option value={PaymentMethod.PIX}>Pix</option>
          <option value={PaymentMethod.DEBIT_CARD}>Cartão de Débito</option>
          <option value={PaymentMethod.CREDIT_CARD}>Cartão de Crédito</option>
        </Select>
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
            disabled={isLoading}
          ></textarea>
        </div>
        <div className="md:col-span-2">
          <Input
            id="event"
            label="Evento (opcional)"
            type="text"
            register={register("event")}
            error={errors.event?.message}
            disabled={isLoading}
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
