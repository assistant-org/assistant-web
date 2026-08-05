import React from "react";
import { Controller } from "react-hook-form";
import { IProductFormProps } from "../types";
import Input from "../../../../shared/components/Input";
import MoneyInput from "../../../../shared/components/MoneyInput";
import Button from "../../../../shared/components/Button";
import { ClipLoader } from "react-spinners";

export default function ProductForm({
  formMethods,
  onSave,
  onCancel,
  isLoading,
}: IProductFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = formMethods;

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <div className="grid grid-cols-1 gap-6">
        <Input
          id="name"
          label="Nome"
          type="text"
          register={register("name")}
          error={errors.name?.message}
          disabled={isLoading}
          placeholder="Ex: Chopp Pilsen"
        />
        <Controller
          name="defaultUnitValue"
          control={control}
          render={({ field }) => (
            <MoneyInput
              id="defaultUnitValue"
              label="Valor"
              value={field.value}
              onChange={field.onChange}
              error={errors.defaultUnitValue?.message}
              disabled={isLoading}
            />
          )}
        />
      </div>

      <div className="mt-8 pt-5">
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
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
