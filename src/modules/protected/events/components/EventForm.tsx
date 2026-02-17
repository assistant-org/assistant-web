import React from "react";
import { IEventFormProps, EventType } from "../types";
import Input from "../../../../shared/components/Input";
import Select from "../../../../shared/components/Select";
import Button from "../../../../shared/components/Button";
import { ClipLoader } from "react-spinners";

export default function EventForm({
  formMethods,
  onSave,
  onCancel,
  isLoading,
}: IEventFormProps) {
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
            label="Nome do Evento"
            type="text"
            register={register("name")}
            error={errors.name?.message}
            disabled={isLoading}
          />
        </div>
        <Input
          id="date"
          label="Data"
          type="date"
          register={register("date")}
          error={errors.date?.message}
          disabled={isLoading}
        />
        <Select
          id="type"
          label="Tipo de Evento"
          register={register("type")}
          error={errors.type?.message}
          disabled={isLoading}
          options={[
            { id: EventType.CLOSED, name: "Evento Fechado" },
            { id: EventType.SINGLE, name: "Evento Avulso" },
          ]}
          optionName="name"
          optionId="id"
        />

        <div className="md:col-span-2">
          <label
            htmlFor="observations"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Observações
          </label>
          <textarea
            id="observations"
            {...register("observations")}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <ClipLoader size={20} color="#ffffff" /> : "Salvar"}
          </Button>
        </div>
      </div>
    </form>
  );
}
