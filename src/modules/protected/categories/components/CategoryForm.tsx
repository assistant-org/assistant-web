import React, { useEffect } from "react";
import {
  ICategoryFormProps,
  CategoryType,
  CATEGORY_TYPE_COLORS,
} from "../types";
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
    watch,
    setValue,
    control,
    formState: { errors },
  } = formMethods;

  const type = watch("type");

  useEffect(() => {
    if (type === CategoryType.INCOME || type === CategoryType.EXPENSE) {
      setValue("color", CATEGORY_TYPE_COLORS[type]);
      setValue("allowsSingleEvent", true);
    }
  }, [type, setValue]);

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
          name="type"
          control={control}
          label="Tipo"
          error={errors.type?.message}
          disabled={isLoading}
          options={[
            { id: CategoryType.INCOME, name: "Receita" },
            { id: CategoryType.EXPENSE, name: "Despesa" },
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
