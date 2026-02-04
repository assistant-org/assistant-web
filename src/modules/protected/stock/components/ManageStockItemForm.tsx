import React from 'react';
import { useWatch } from 'react-hook-form';
import { IManageStockItemFormProps, StockCategory, StockStatus } from '../types';
import Input from '../../../../shared/components/Input';
import Select from '../../../../shared/components/Select';
import Button from '../../../../shared/components/Button';
import StockExitForm from './StockExitForm';

export default function ManageStockItemForm({ 
    itemFormMethods, onSaveItem, onCancel, isSavingItem,
    exitFormMethods, onSaveExit, isSavingExit, currentItem
}: IManageStockItemFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = itemFormMethods;

  const isEditing = !!currentItem;
  const unitLiters = useWatch({ control, name: 'unitLiters', defaultValue: 0 });
  const unitCount = useWatch({ control, name: 'unitCount', defaultValue: 0 });
  const totalQuantity = (unitLiters || 0) * (unitCount || 0);

  return (
    <div>
        {/* Section 1: Edit Item Details */}
        <form onSubmit={handleSubmit(onSaveItem)}>
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Detalhes do Lote</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                <div className="md:col-span-2">
                    <Input id="productName" label="Nome do Produto (Ex: Pilsen, IPA)" type="text" register={register('productName')} error={errors.productName?.message} disabled={isSavingItem} />
                </div>
                 <Select id="category" label="Categoria do Chopp" register={register('category')} error={errors.category?.message} disabled={isSavingItem}>
                    <option value="">Selecione...</option>
                    {Object.values(StockCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </Select>
                <Input id="entryDate" label="Data de Entrada" type="date" register={register('entryDate')} error={errors.entryDate?.message} disabled={isSavingItem} />
                <Input id="expiryDate" label="Data de Validade" type="date" register={register('expiryDate')} error={errors.expiryDate?.message} disabled={isSavingItem} />
                
                {/* Batch Creation Fields */}
                <Select id="unitLiters" label="Litragem por unidade" register={register('unitLiters', { valueAsNumber: true })} error={errors.unitLiters?.message} disabled={isSavingItem || isEditing}>
                    <option value="">Selecione...</option>
                    <option value="10">10 Litros</option>
                    <option value="20">20 Litros</option>
                    <option value="30">30 Litros</option>
                    <option value="50">50 Litros</option>
                </Select>
                <Input id="unitCount" label="Qtd. de unidades (barris)" type="number" register={register('unitCount', { valueAsNumber: true })} error={errors.unitCount?.message} disabled={isSavingItem || isEditing} />

                {!isEditing && totalQuantity > 0 && (
                    <div className="md:col-span-2 bg-indigo-50 dark:bg-indigo-900 p-3 rounded-md text-center">
                        <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                            Quantidade Total do Lote: <span className="font-bold">{totalQuantity} Litros</span>
                        </p>
                    </div>
                )}
                
                <Input id="unitPrice" label="Preço Unitário (por barril)" type="number" step="0.01" register={register('unitPrice', { valueAsNumber: true })} error={errors.unitPrice?.message} disabled={isSavingItem} />

                <div className="md:col-span-2">
                    <label htmlFor="observations" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observações</label>
                    <textarea id="observations" {...register('observations')} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" disabled={isSavingItem}></textarea>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
                 <Button type="button" variant="secondary" onClick={onCancel} disabled={isSavingItem || isSavingExit}>Fechar</Button>
                 <Button type="submit" isLoading={isSavingItem} disabled={isSavingExit}>Salvar Alterações</Button>
            </div>
        </form>

        {/* Section 2: Register Exit (only for existing items) */}
        {currentItem && (
             <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Registrar Nova Saída</h3>
                {currentItem.status === StockStatus.CLOSED ? (
                     <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-200 p-3 rounded-md">Este item está encerrado e não pode ter novas saídas registradas.</p>
                ) : (
                    <StockExitForm formMethods={exitFormMethods} onSave={onSaveExit} isLoading={isSavingExit} currentItem={currentItem} />
                )}
             </div>
        )}
    </div>
  );
}
