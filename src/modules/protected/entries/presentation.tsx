import React from 'react';
import { IEntriesPresentationProps, EventType, PaymentMethod } from './types';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Modal from '../../../shared/components/Modal';
import EntryForm from './components/EntryForm';

const inputBaseClasses = "block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-indigo-500 focus:ring-indigo-500";
const labelBaseClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function EntriesPresentation({
    entries,
    filters,
    onFilterChange,
    onClearFilters,
    onOpenModal,
    onDeleteEntry,
    isModalOpen,
    onCloseModal,
    editingEntry,
    formMethods,
    onSave,
    isLoading,
    availableStockItems,
}: IEntriesPresentationProps) {
  
  const totalEntries = entries.reduce((acc, entry) => acc + entry.value, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Entradas</h1>
        <Button onClick={() => onOpenModal()}>+ Nova Entrada</Button>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-3">
                <label className={labelBaseClasses}>Período</label>
                <div className="flex items-center space-x-2">
                    <input type="date" value={filters.startDate} onChange={(e) => onFilterChange('startDate', e.target.value)} className={inputBaseClasses} />
                    <span className="text-gray-500">até</span>
                    <input type="date" value={filters.endDate} onChange={(e) => onFilterChange('endDate', e.target.value)} className={inputBaseClasses} />
                </div>
            </div>
            <div className="lg:col-span-2">
                <label htmlFor="filter-category" className={labelBaseClasses}>Categoria</label>
                <select id="filter-category" value={filters.category} onChange={(e) => onFilterChange('category', e.target.value)} className={inputBaseClasses}>
                    <option value="">Todas</option>
                    <option value="Venda de Chopp">Venda de Chopp</option>
                    <option value="Serviço de Bar">Serviço de Bar</option>
                    <option value="Aluguel de Equipamento">Aluguel de Equipamento</option>
                </select>
            </div>
            <div className="lg:col-span-2">
                <label htmlFor="filter-event" className={labelBaseClasses}>Evento</label>
                <input type="text" id="filter-event" placeholder="Buscar evento..." value={filters.event} onChange={(e) => onFilterChange('event', e.target.value)} className={inputBaseClasses} />
            </div>
             <div className="lg:col-span-2">
                <label htmlFor="filter-eventType" className={labelBaseClasses}>Tipo de Evento</label>
                <select id="filter-eventType" value={filters.eventType} onChange={(e) => onFilterChange('eventType', e.target.value)} className={inputBaseClasses}>
                    <option value="">Todos</option>
                    <option value={EventType.CLOSED}>Fechado</option>
                    <option value={EventType.SINGLE}>Avulso</option>
                </select>
            </div>
            <div className="lg:col-span-2">
                <label htmlFor="filter-paymentMethod" className={labelBaseClasses}>Forma de Pgto</label>
                <select id="filter-paymentMethod" value={filters.paymentMethod} onChange={(e) => onFilterChange('paymentMethod', e.target.value)} className={inputBaseClasses}>
                     <option value="">Todas</option>
                     <option value={PaymentMethod.CASH}>Dinheiro</option>
                     <option value={PaymentMethod.PIX}>Pix</option>
                     <option value={PaymentMethod.CARD}>Cartão</option>
                </select>
            </div>
            <div className="lg:col-span-1">
                <Button onClick={onClearFilters} variant="secondary" fullWidth>Limpar</Button>
            </div>
        </div>
      </Card>
      
      <Card>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Data</th>
                        <th scope="col" className="px-6 py-3">Categoria</th>
                        <th scope="col" className="px-6 py-3">Evento</th>
                        <th scope="col" className="px-6 py-3">Tipo</th>
                        <th scope="col" className="px-6 py-3">Pgto</th>
                        <th scope="col" className="px-6 py-3 text-right">Valor</th>
                        <th scope="col" className="px-6 py-3 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map(entry => (
                        <tr key={entry.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                            <td className="px-6 py-4">{new Date(entry.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4">{entry.category}</td>
                            <td className="px-6 py-4">{entry.event || '-'}</td>
                            <td className="px-6 py-4 capitalize">{entry.eventType}</td>
                            <td className="px-6 py-4 capitalize">{entry.paymentMethod || '-'}</td>
                            <td className="px-6 py-4 text-right font-medium text-green-500">
                                {entry.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button onClick={() => onOpenModal(entry)} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline mr-4">Editar</button>
                                <button onClick={() => onDeleteEntry(entry.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Excluir</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700">
                        <td colSpan={5} className="px-6 py-3 text-base text-right">Total</td>
                        <td className="px-6 py-3 text-base text-right">{totalEntries.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={onCloseModal} title={editingEntry ? 'Editar Entrada' : 'Nova Entrada'}>
        <EntryForm
            formMethods={formMethods}
            onSave={onSave}
            onCancel={onCloseModal}
            isLoading={isLoading}
            availableStockItems={availableStockItems}
        />
      </Modal>
    </div>
  );
}