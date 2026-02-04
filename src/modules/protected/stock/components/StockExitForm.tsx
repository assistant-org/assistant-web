import React from 'react';
import { IStockExitFormProps, ExitReason } from '../types';
import Input from '../../../../shared/components/Input';
import Select from '../../../../shared/components/Select';
import Button from '../../../../shared/components/Button';

export default function StockExitForm({ formMethods, onSave, isLoading, currentItem }: IStockExitFormProps) {
  const { register, handleSubmit, formState: { errors } } = formMethods;

  return (
    <form onSubmit={handleSubmit(onSave)}>
        <div className="mb-4 bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <p className="font-bold text-yellow-800 dark:text-yellow-200">Atenção</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                A quantidade disponível em estoque para este item é <strong>{currentItem?.availableQuantityLiters} L</strong>.
            </p>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <Input
          id="exit_quantity" // Changed ID to avoid conflict with item form
          label="Quantidade a Retirar (L)"
          type="number"
          step="0.1"
          register={register('quantity', { valueAsNumber: true })}
          error={errors.quantity?.message}
          disabled={isLoading}
        />
        <Select
            id="reason"
            label="Motivo da Saída"
            register={register('reason')}
            error={errors.reason?.message}
            disabled={isLoading}
        >
            <option value="">Selecione...</option>
            <option value={ExitReason.EVENT}>Evento</option>
            <option value={ExitReason.LOSS}>Perda</option>
            <option value={ExitReason.INTERNAL}>Consumo Interno</option>
        </Select>
      </div>

      <div className="mt-6">
        <div className="flex justify-end">
            <Button type="submit" isLoading={isLoading}>
                Registrar Saída
            </Button>
        </div>
      </div>
    </form>
  );
}
