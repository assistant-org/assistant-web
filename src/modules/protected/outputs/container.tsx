import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { outputFormSchema, OutputFormSchema } from './schema';
import OutputsPresentation from './presentation';
import { IOutputsPresentationProps, IOutput, IFilters, OutputType, PaymentMethod } from './types';

// Mock data
const mockOutputs: IOutput[] = [
    { id: '1', date: '2024-07-20', category: 'Insumos', type: OutputType.VARIABLE, paymentMethod: PaymentMethod.BANK_TRANSFER, value: 1800, description: 'Compra de 3 barris de Pilsen' },
    { id: '2', date: '2024-07-18', category: 'Marketing', type: OutputType.VARIABLE, paymentMethod: PaymentMethod.PIX, value: 350 },
    { id: '3', date: '2024-07-15', category: 'Aluguel', type: OutputType.FIXED, paymentMethod: PaymentMethod.BANK_TRANSFER, value: 1200, isRecurring: true, recurrenceDay: 10 },
    { id: '4', date: '2024-07-12', category: 'Combustível', type: OutputType.VARIABLE, paymentMethod: PaymentMethod.CARD, value: 250, description: 'Abastecimento van' },
];

const initialFilters: IFilters = { startDate: '', endDate: '', category: '', type: '', paymentMethod: '' };

export default function OutputsContainer() {
  const [outputs, setOutputs] = useState<IOutput[]>(mockOutputs);
  const [filters, setFilters] = useState<IFilters>(initialFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutput, setEditingOutput] = useState<IOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formMethods = useForm<OutputFormSchema>({
    resolver: zodResolver(outputFormSchema),
  });

  useEffect(() => {
      if (editingOutput) {
        formMethods.reset({
            ...editingOutput,
            value: Number(editingOutput.value) || 0,
            recurrenceDay: Number(editingOutput.recurrenceDay) || undefined,
        });
      } else {
        formMethods.reset({
            date: new Date().toISOString().split('T')[0],
            value: undefined,
            category: '',
            paymentMethod: undefined,
            description: '',
            isRecurring: false,
            recurrenceDay: undefined,
        });
      }
  }, [editingOutput, isModalOpen, formMethods]);

  const handleFilterChange = (field: keyof IFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  }

  const filteredOutputs = useMemo(() => {
    return outputs.filter(output => {
        const categoryMatch = filters.category ? output.category === filters.category : true;
        const typeMatch = filters.type ? output.type === filters.type : true;
        const paymentMethodMatch = filters.paymentMethod ? output.paymentMethod === filters.paymentMethod : true;
        const startDateMatch = filters.startDate ? output.date >= filters.startDate : true;
        const endDateMatch = filters.endDate ? output.date <= filters.endDate : true;
        
        return categoryMatch && typeMatch && paymentMethodMatch && startDateMatch && endDateMatch;
    });
  }, [outputs, filters]);

  const handleOpenModal = (output?: IOutput) => {
    setEditingOutput(output || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOutput(null);
  };

  const handleSaveOutput = (data: OutputFormSchema) => {
    setIsLoading(true);
    setTimeout(() => {
        if (editingOutput) {
            setOutputs(prev => prev.map(o => o.id === editingOutput.id ? { ...o, ...data, id: editingOutput.id } : o));
        } else {
            const newOutput: IOutput = { ...data, id: String(Date.now()) };
            setOutputs(prev => [newOutput, ...prev]);
        }
        setIsLoading(false);
        handleCloseModal();
    }, 1000);
  };

  const handleDeleteOutput = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta saída?')) {
        setOutputs(prev => prev.filter(o => o.id !== id));
    }
  };

  const presentationProps: IOutputsPresentationProps = {
    outputs: filteredOutputs,
    filters,
    onFilterChange: handleFilterChange,
    onClearFilters: handleClearFilters,
    onOpenModal: handleOpenModal,
    onDeleteOutput: handleDeleteOutput,
    isModalOpen,
    onCloseModal: handleCloseModal,
    editingOutput,
    formMethods,
    onSave: handleSaveOutput,
    isLoading,
  };

  return <OutputsPresentation {...presentationProps} />;
}
