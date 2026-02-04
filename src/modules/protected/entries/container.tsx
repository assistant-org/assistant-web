import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { entryFormSchema, EntryFormSchema } from './schema';
import EntriesPresentation from './presentation';
import { IEntriesPresentationProps, IEntry, IFilters, EventType, PaymentMethod } from './types';
import { mockStockItems } from '../stock/container';
import { IStockItem, StockStatus } from '../stock/types';


// Mock data
const mockEntries: IEntry[] = [
    { id: '1', date: '2024-07-20', category: 'Venda de Chopp', event: 'Festa Junina Local', eventType: EventType.SINGLE, value: 1500, beerControl: [{ stockItemId: '1', quantityTaken: 50, quantityReturned: 10 }] },
    { id: '2', date: '2024-07-18', category: 'Serviço de Bar', event: 'Casamento S&J', eventType: EventType.CLOSED, paymentMethod: PaymentMethod.PIX, value: 3500 },
    { id: '3', date: '2024-07-15', category: 'Venda de Chopp', event: 'Aniversário Sr. Carlos', eventType: EventType.CLOSED, paymentMethod: PaymentMethod.CARD, value: 2200 },
    { id: '4', date: '2024-07-12', category: 'Aluguel de Equipamento', eventType: EventType.CLOSED, paymentMethod: PaymentMethod.CASH, value: 800, description: 'Aluguel chopeira' },
];

const initialFilters: IFilters = { startDate: '', endDate: '', category: '', event: '', eventType: '', paymentMethod: '' };

export default function EntriesContainer() {
  const [entries, setEntries] = useState<IEntry[]>(mockEntries);
  const [stockItems, setStockItems] = useState<IStockItem[]>(mockStockItems);
  const [filters, setFilters] = useState<IFilters>(initialFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formMethods = useForm<EntryFormSchema>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: {
      beerControl: []
    }
  });

  useEffect(() => {
      if (editingEntry) {
        formMethods.reset({
            ...editingEntry,
            value: Number(editingEntry.value) || 0,
            beerControl: editingEntry.beerControl?.map(bc => ({
                ...bc,
                quantityTaken: Number(bc.quantityTaken) || 0,
                quantityReturned: Number(bc.quantityReturned) || 0,
            })) || []
        });
      } else {
        formMethods.reset({
            date: new Date().toISOString().split('T')[0],
            value: undefined,
            category: '',
            event: '',
            eventType: undefined,
            description: '',
            paymentMethod: undefined,
            beerControl: [],
        });
      }
  }, [editingEntry, isModalOpen, formMethods]);

  const handleFilterChange = (field: keyof IFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  }

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
        const eventMatch = filters.event
            ? entry.event?.toLowerCase().includes(filters.event.toLowerCase())
            : true;
        const categoryMatch = filters.category ? entry.category === filters.category : true;
        const eventTypeMatch = filters.eventType ? entry.eventType === filters.eventType : true;
        const paymentMethodMatch = filters.paymentMethod ? entry.paymentMethod === filters.paymentMethod : true;
        const startDateMatch = filters.startDate ? entry.date >= filters.startDate : true;
        const endDateMatch = filters.endDate ? entry.date <= filters.endDate : true;
        
        return eventMatch && categoryMatch && eventTypeMatch && paymentMethodMatch && startDateMatch && endDateMatch;
    });
  }, [entries, filters]);

   const availableStockItems = useMemo(() => {
    return stockItems.filter(item => item.status === StockStatus.ACTIVE && item.availableQuantityLiters > 0);
  }, [stockItems]);

  const handleOpenModal = (entry?: IEntry) => {
    setEditingEntry(entry || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const handleSaveEntry = (data: EntryFormSchema) => {
    if (data.beerControl) {
      for (let i = 0; i < data.beerControl.length; i++) {
        const control = data.beerControl[i];
        const stockItem = stockItems.find(s => s.id === control.stockItemId);
        if (!stockItem) {
          alert('Erro: item de estoque selecionado é inválido.');
          return;
        }
        if (control.quantityTaken > stockItem.availableQuantityLiters) {
          formMethods.setError(`beerControl.${i}.quantityTaken`, { message: `Máx: ${stockItem.availableQuantityLiters}L` });
          return;
        }
      }
    }

    setIsLoading(true);
    setTimeout(() => {
      if (editingEntry) {
        setEntries(prev => prev.map(e => e.id === editingEntry.id ? { ...e, ...data, id: editingEntry.id } : e));
      } else {
        const newEntry: IEntry = { ...data, id: String(Date.now()) };
        setEntries(prev => [newEntry, ...prev]);
      }

      if (data.beerControl) {
        let stockToUpdate = [...stockItems];
        data.beerControl.forEach(control => {
          const consumed = control.quantityTaken - control.quantityReturned;
          if (consumed > 0) {
            stockToUpdate = stockToUpdate.map(stock => {
              if (stock.id === control.stockItemId) {
                const newAvailable = stock.availableQuantityLiters - consumed;
                const isClosed = newAvailable <= 0;
                return {
                  ...stock,
                  availableQuantityLiters: newAvailable,
                  status: isClosed ? StockStatus.CLOSED : stock.status,
                  closureDate: isClosed ? new Date().toISOString() : stock.closureDate,
                };
              }
              return stock;
            });
          }
        });
        setStockItems(stockToUpdate);
      }

      setIsLoading(false);
      handleCloseModal();
    }, 1000);
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta entrada?')) {
        setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const presentationProps: IEntriesPresentationProps = {
    entries: filteredEntries,
    filters,
    onFilterChange: handleFilterChange,
    onClearFilters: handleClearFilters,
    onOpenModal: handleOpenModal,
    onDeleteEntry: handleDeleteEntry,
    isModalOpen,
    onCloseModal: handleCloseModal,
    editingEntry,
    formMethods,
    onSave: handleSaveEntry,
    isLoading,
    availableStockItems,
  };

  return <EntriesPresentation {...presentationProps} />;
}