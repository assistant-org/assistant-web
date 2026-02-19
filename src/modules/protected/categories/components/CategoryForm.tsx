import React from "react";
import { ICategoryFormProps, CategoryType } from "../types";
import Input from "../../../../shared/components/Input";
import Select from "../../../../shared/components/Select";
import Button from "../../../../shared/components/Button";

export default function CategoryForm({
  formMethods,
  onSave,
  onCancel,
  isLoading,
}: ICategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = formMethods;

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            id="name"
            label="Nome da Categoria"
            type="text"
            register={register("name")}
            error={errors.name?.message}
            disabled={isLoading}
          />
        </div>
        <Select
          id="type"
          label="Tipo"
          register={register("type")}
          error={errors.type?.message}
          disabled={isLoading}
        >
          <option value="">Selecione...</option>
          <option value={CategoryType.ENTRY}>Entrada</option>
          <option value={CategoryType.OUTPUT}>Saída</option>
        </Select>
        <div className="flex items-end">
          <Input
            id="color"
            label="Cor (para gráficos)"
            type="color"
            register={register("color")}
            error={errors.color?.message}
            disabled={isLoading}
            className="p-1 h-10 w-14 block bg-white border border-gray-300 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700"
          />
        </div>
        <div className="md:col-span-2 flex items-start space-x-4">
          <div className="flex h-6 items-center">
            <input
              id="allowsSingleEvent"
              type="checkbox"
              {...register("allowsSingleEvent")}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              disabled={isLoading}
            />
          </div>
          <div className="text-sm">
            <label
              htmlFor="allowsSingleEvent"
              className="font-medium text-gray-900 dark:text-gray-200"
            >
              Permite Evento Avulso?
            </label>
            <p className="text-gray-500 dark:text-gray-400">
              Marque se esta categoria pode ser usada em eventos avulsos.
            </p>
          </div>
        </div>
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
          <Button type="submit" isLoading={isLoading}>
            Salvar
          </Button>
        </div>
      </div>
    </form>
  );
}
