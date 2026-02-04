import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CategoriesPresentation from './presentation';
import { categoryFormSchema, CategoryFormSchema } from './schema';
import { ICategoriesPresentationProps, ICategory, CategoryType } from './types';

const mockCategories: ICategory[] = [
    { id: '1', name: 'Venda de Chopp', type: CategoryType.ENTRY, status: 'active', color: '#4CAF50', allowsSingleEvent: true },
    { id: '2', name: 'Insumos', type: CategoryType.OUTPUT, status: 'active', color: '#F44336' },
    { id: '3', name: 'Serviço de Bar', type: CategoryType.ENTRY, status: 'active', color: '#2196F3', allowsSingleEvent: false },
    { id: '4', name: 'Marketing', type: CategoryType.OUTPUT, status: 'inactive', color: '#FFC107' },
    { id: '5', name: 'Aluguel de Equipamento', type: CategoryType.ENTRY, status: 'active', color: '#00BCD4' },
];

export default function CategoriesContainer() {
    const [categories, setCategories] = useState<ICategory[]>(mockCategories);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const formMethods = useForm<CategoryFormSchema>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: {
            color: '#000000',
        }
    });

    useEffect(() => {
        if (editingCategory) {
            formMethods.reset(editingCategory);
        } else {
            formMethods.reset({
                name: '',
                type: undefined,
                allowsSingleEvent: false,
                color: '#000000',
                description: '',
            });
        }
    }, [editingCategory, isModalOpen, formMethods]);

    const handleOpenModal = (category?: ICategory) => {
        setEditingCategory(category || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleSaveCategory = (data: CategoryFormSchema) => {
        setIsLoading(true);
        setTimeout(() => {
            if (editingCategory) {
                setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...data, id: editingCategory.id, status: editingCategory.status } : c));
            } else {
                const newCategory: ICategory = { ...data, id: String(Date.now()), status: 'active' };
                setCategories(prev => [newCategory, ...prev]);
            }
            setIsLoading(false);
            handleCloseModal();
        }, 1000);
    };

    const handleToggleStatus = (id: string) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c));
    };

    const presentationProps: ICategoriesPresentationProps = {
        categories,
        onOpenModal: handleOpenModal,
        onToggleStatus: handleToggleStatus,
        isModalOpen,
        onCloseModal: handleCloseModal,
        editingCategory,
        formMethods,
        onSave: handleSaveCategory,
        isLoading,
    };

    return <CategoriesPresentation {...presentationProps} />;
}
