import React from 'react';
import { IStockPresentationProps, StockCategory, StockStatus } from './types';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Modal from '../../../shared/components/Modal';
import ManageStockItemForm from './components/ManageStockItemForm';
import StockItemDetails from './components/StockItemDetails';

const inputBaseClasses = "block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-indigo-500 focus:ring-indigo-500";
const labelBaseClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

const StatusBadge: React.FC<{ status: StockStatus }> = ({ status }) => {
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    const statusClasses = {
        [StockStatus.ACTIVE]: 'bg-green-100 text-green-800',
        [StockStatus.CLOSED]: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`${baseClasses} ${statusClasses[status]}`}>
            {status === StockStatus.ACTIVE ? 'Ativo' : 'Encerrado'}
        </span>
    );
};

export default function StockPresentation({
    stockItems, filters, onFilterChange, onClearFilters, onOpenEditModal,
    isDetailsModalOpen, onOpenDetailsModal, onCloseDetailsModal, selectedItemForDetails,
    isEditModalOpen, onCloseEditModal, editingItem, itemFormMethods, onSaveItem, isSavingItem,
    exitFormMethods, onSaveExit, isSavingExit
}: IStockPresentationProps) {
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Estoque</h1>
        <Button onClick={() => onOpenEditModal()}>+ Novo Item</Button>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-3">
                <label htmlFor="filter-productName" className={labelBaseClasses}>Produto</label>
                <input type="text" id="filter-productName" placeholder="Buscar produto..." value={filters.productName} onChange={(e) => onFilterChange('productName', e.target.value)} className={inputBaseClasses} />
            </div>
            <div className="lg:col-span-3">
                <label htmlFor="filter-category" className={labelBaseClasses}>Categoria</label>
                <select id="filter-category" value={filters.category} onChange={(e) => onFilterChange('category', e.target.value)} className={inputBaseClasses}>
                    <option value="">Todas</option>
                    {Object.values(StockCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div className="lg:col-span-2">
                <label htmlFor="filter-status" className={labelBaseClasses}>Status</label>
                <select id="filter-status" value={filters.status} onChange={(e) => onFilterChange('status', e.target.value)} className={inputBaseClasses}>
                    <option value="">Todos</option>
                    <option value={StockStatus.ACTIVE}>Ativo</option>
                    <option value={StockStatus.CLOSED}>Encerrado</option>
                </select>
            </div>
            <div className="lg:col-span-3">
                 <label htmlFor="filter-expiryDate" className={labelBaseClasses}>Validade até</label>
                <input type="date" id="filter-expiryDate" value={filters.expiryDate} onChange={(e) => onFilterChange('expiryDate', e.target.value)} className={inputBaseClasses} />
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
                        <th scope="col" className="px-6 py-3">Produto</th>
                        <th scope="col" className="px-6 py-3">Categoria</th>
                        <th scope="col" className="px-6 py-3">Data Entrada</th>
                        <th scope="col" className="px-6 py-3">Validade</th>
                        <th scope="col" className="px-6 py-3 text-right">Unidades</th>
                        <th scope="col" className="px-6 py-3 text-right">Qtd. Total (L)</th>
                        <th scope="col" className="px-6 py-3 text-right">Qtd. Disp. (L)</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {stockItems.map(item => (
                        <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.productName}</td>
                            <td className="px-6 py-4">{item.category}</td>
                            <td className="px-6 py-4">{new Date(item.entryDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4">{new Date(item.expiryDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right">{item.unitCount}</td>
                            <td className="px-6 py-4 text-right">{item.initialQuantityLiters}</td>
                            <td className="px-6 py-4 text-right font-bold">{item.availableQuantityLiters}</td>
                            <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                            <td className="px-6 py-4 text-center">
                                <button onClick={() => onOpenDetailsModal(item)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-3">Detalhes</button>
                                <button onClick={() => onOpenEditModal(item)} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline">Editar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>

      <Modal isOpen={isEditModalOpen} onClose={onCloseEditModal} title={editingItem ? 'Gerenciar Item de Estoque' : 'Novo Lote de Estoque'}>
        <ManageStockItemForm 
            itemFormMethods={itemFormMethods} 
            onSaveItem={onSaveItem} 
            onCancel={onCloseEditModal} 
            isSavingItem={isSavingItem}
            exitFormMethods={exitFormMethods}
            onSaveExit={onSaveExit}
            isSavingExit={isSavingExit}
            currentItem={editingItem}
        />
      </Modal>
      
      <Modal isOpen={isDetailsModalOpen} onClose={onCloseDetailsModal} title={`Detalhes - ${selectedItemForDetails?.productName || ''}`}>
        <StockItemDetails item={selectedItemForDetails} />
      </Modal>
    </div>
  );
}
