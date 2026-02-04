import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { stockItemFormSchema, StockItemFormSchema, stockExitFormSchema, StockExitFormSchema } from './schema';
import StockPresentation from './presentation';
import { IStockPresentationProps, IStockItem, IStockFilters, StockCategory, StockStatus, ExitReason, IStockMovement } from './types';

export const mockStockItems: IStockItem[] = [
    // FIX: Added unitPrice to mock data to align with the updated IStockItem interface.
    { id: '1', productName: 'Barril Chopp Pilsen', category: StockCategory.PILSEN, entryDate: '2024-07-01', expiryDate: '2024-09-30', unitLiters: 50, unitCount: 10, unitPrice: 350, initialQuantityLiters: 500, availableQuantityLiters: 450, status: StockStatus.ACTIVE, movements: [{ id: 'm1', date: '2024-07-20', quantity: 50, reason: ExitReason.EVENT }] },
    { id: '2', productName: 'Barril Chopp IPA', category: StockCategory.IPA, entryDate: '2024-07-05', expiryDate: '2024-08-20', unitLiters: 30, unitCount: 5, unitPrice: 450, initialQuantityLiters: 150, availableQuantityLiters: 150, status: StockStatus.ACTIVE, movements: [] },
    { id: '3', productName: 'Barril Chopp Weiss', category: StockCategory.WEISS, entryDate: '2024-06-10', expiryDate: '2024-07-25', unitLiters: 30, unitCount: 2, unitPrice: 420, initialQuantityLiters: 60, availableQuantityLiters: 0, status: StockStatus.CLOSED, closureDate: '2024-07-22', movements: [] },
    { id: '4', productName: 'Barril Chopp Lager', category: StockCategory.LAGER, entryDate: '2024-07-10', expiryDate: '2024-10-15', unitLiters: 50, unitCount: 8, unitPrice: 320, initialQuantityLiters: 400, availableQuantityLiters: 400, status: StockStatus.ACTIVE, movements: [] },
];

const initialFilters: IStockFilters = { productName: '', category: '', status: '', expiryDate: '' };

export default function StockContainer() {
  const [stockItems, setStockItems] = useState<IStockItem[]>(mockStockItems);
  const [filters, setFilters] = useState<IStockFilters>(initialFilters);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IStockItem | null>(null);
  const [isSavingItem, setIsSavingItem] = useState(false);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<IStockItem | null>(null);

  const [isSavingExit, setIsSavingExit] = useState(false);

  const itemFormMethods = useForm<StockItemFormSchema>({
    resolver: zodResolver(stockItemFormSchema),
  });

  const exitFormMethods = useForm<StockExitFormSchema>({
      resolver: zodResolver(stockExitFormSchema),
  });

  useEffect(() => {
      if (editingItem) {
        itemFormMethods.reset({
            ...editingItem
        });
      } else {
        itemFormMethods.reset({
            productName: '',
            category: undefined,
            entryDate: new Date().toISOString().split('T')[0],
            expiryDate: '',
            unitLiters: undefined,
            unitCount: undefined,
            // FIX: Added unitPrice to the form reset logic.
            unitPrice: undefined,
            observations: '',
        });
      }
  }, [editingItem, isEditModalOpen, itemFormMethods]);

  const handleFilterChange = (field: keyof IStockFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => setFilters(initialFilters);

  const filteredStockItems = useMemo(() => {
    return stockItems.filter(item => {
        const nameMatch = filters.productName ? item.productName.toLowerCase().includes(filters.productName.toLowerCase()) : true;
        const categoryMatch = filters.category ? item.category === filters.category : true;
        const statusMatch = filters.status ? item.status === filters.status : true;
        const expiryDateMatch = filters.expiryDate ? item.expiryDate <= filters.expiryDate : true;
        return nameMatch && categoryMatch && statusMatch && expiryDateMatch;
    });
  }, [stockItems, filters]);

  const handleOpenEditModal = (item?: IStockItem) => {
    setEditingItem(item || null);
    exitFormMethods.reset();
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleOpenDetailsModal = (item: IStockItem) => {
    setSelectedItemForDetails(item);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedItemForDetails(null);
  };

  const handleSaveItem = (data: StockItemFormSchema) => {
    setIsSavingItem(true);
    setTimeout(() => {
        if (editingItem) {
            // Update existing item, but don't allow changing batch info
            setStockItems(prev => prev.map(item => item.id === editingItem.id ? { 
                ...item, 
                productName: data.productName,
                category: data.category,
                entryDate: data.entryDate,
                expiryDate: data.expiryDate,
                // FIX: Added unitPrice to the item update logic.
                unitPrice: data.unitPrice,
                observations: data.observations,
            } : item));
        } else {
            // Create new batch
            const totalLiters = data.unitLiters * data.unitCount;
            const newItem: IStockItem = { 
                ...data, 
                id: String(Date.now()), 
                status: StockStatus.ACTIVE,
                initialQuantityLiters: totalLiters,
                availableQuantityLiters: totalLiters,
                movements: [] 
            };
            setStockItems(prev => [newItem, ...prev]);
        }
        setIsSavingItem(false);
        handleCloseEditModal();
    }, 1000);
  };
  
  const handleSaveExit = (data: StockExitFormSchema) => {
      if (!editingItem) return;

      if(data.quantity > editingItem.availableQuantityLiters) {
          exitFormMethods.setError("quantity", { type: "manual", message: "Quantidade de saída maior que o disponível."});
          return;
      }

      setIsSavingExit(true);
      setTimeout(() => {
        const newMovement: IStockMovement = {
          id: String(Date.now()),
          date: new Date().toISOString(),
          quantity: data.quantity,
          reason: data.reason,
        };
        
        const updatedItems = stockItems.map(item => {
          if (item.id === editingItem.id) {
            const newAvailableQuantity = item.availableQuantityLiters - data.quantity;
            const isNowClosed = newAvailableQuantity <= 0;

            const updatedItem = {
              ...item,
              availableQuantityLiters: newAvailableQuantity,
              status: isNowClosed ? StockStatus.CLOSED : item.status,
              closureDate: isNowClosed ? new Date().toISOString() : item.closureDate,
              movements: [...(item.movements || []), newMovement],
            };
            setEditingItem(updatedItem); // Refresh editing item state
            return updatedItem;
          }
          return item;
        });

        setStockItems(updatedItems);
        setIsSavingExit(false);
        exitFormMethods.reset();
        alert('Saída registrada com sucesso!');
      }, 1000);
  };

  const presentationProps: IStockPresentationProps = {
    stockItems: filteredStockItems,
    filters,
    onFilterChange: handleFilterChange,
    onClearFilters: handleClearFilters,
    
    onOpenEditModal: handleOpenEditModal,
    
    isDetailsModalOpen,
    onOpenDetailsModal: handleOpenDetailsModal,
    onCloseDetailsModal: handleCloseDetailsModal,
    selectedItemForDetails,
    
    isEditModalOpen,
    onCloseEditModal: handleCloseEditModal,
    editingItem,
    itemFormMethods,
    onSaveItem: handleSaveItem,
    isSavingItem,

    exitFormMethods,
    onSaveExit: handleSaveExit,
    isSavingExit,
  };

  return <StockPresentation {...presentationProps} />;
}