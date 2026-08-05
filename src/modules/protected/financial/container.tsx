import React, { useState, useEffect, useCallback } from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionFormSchema } from "./schema";
import FinancialPresentation from "./presentation";
import {
  IFinancialFilters,
  IFinancialPresentationProps,
  IEventOption,
  IFinancialTotals,
  TransactionFormValues,
} from "./types";
import { transactionsService } from "../../../shared/services/transactions/transactions.service";
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "../../../shared/services/transactions/types";
import { accountsService } from "../../../shared/services/accounts/accounts.service";
import { Account } from "../../../shared/services/accounts/types";
import { useCategories } from "../../../shared/hooks/useCategories";
import { useToast } from "../../../shared/context/ToastContext";
import { eventsService } from "../../../shared/services/events/events.service";
import { isFeatureEnabled } from "../../../shared/config/features";
import { useServerList } from "../../../shared/hooks/useServerList";
import { todayISODate } from "../../../shared/utils/formatDate";

const initialFilters: IFinancialFilters = {
  startDate: "",
  endDate: "",
  type: "",
  categoryId: "",
  accountId: "",
  origin: "",
  eventId: "",
  status: TransactionStatus.ACTIVE,
};

function toServiceFilters(filters: IFinancialFilters) {
  return {
    dateFrom: filters.startDate || undefined,
    dateTo: filters.endDate || undefined,
    type: (filters.type as TransactionType | "") || undefined,
    categoryId: filters.categoryId || undefined,
    accountId: filters.accountId || undefined,
    origin: filters.origin || undefined,
    eventId: filters.eventId || undefined,
    status: filters.status || TransactionStatus.ACTIVE,
  };
}

export default function FinancialContainer() {
  const eventsEnabled = isFeatureEnabled("events");

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [events, setEvents] = useState<IEventOption[]>([]);
  const [totals, setTotals] = useState<IFinancialTotals>({
    income: 0,
    expense: 0,
    balance: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { categories } = useCategories();
  const { success, error: toastError } = useToast();

  const fetchTransactions = useCallback(
    async (params: IFinancialFilters & { page: number; pageSize: number }) => {
      const { page, pageSize, ...filters } = params;
      return transactionsService.findPage({
        ...toServiceFilters(filters),
        page,
        pageSize,
      });
    },
    [],
  );

  const list = useServerList(fetchTransactions, {
    initialFilters,
    initialPageSize: 10,
  });

  const loadTotals = useCallback(async (filters: IFinancialFilters) => {
    const result = await transactionsService.summarize(toServiceFilters(filters));
    if (result.data) {
      setTotals(result.data);
    }
  }, []);

  useEffect(() => {
    void loadTotals(list.filters);
  }, [list.filters, loadTotals]);

  useEffect(() => {
    if (list.error) toastError(list.error);
  }, [list.error, toastError]);

  const loadAccounts = useCallback(async () => {
    const result = await accountsService.findAll({ includeInactive: true });
    if (result.data) setAccounts(result.data);
  }, []);

  const loadEvents = useCallback(async () => {
    if (!eventsEnabled) return;
    const result = await eventsService.findAll();
    if (result.data) {
      setEvents(result.data.map((e) => ({ id: String(e.id), name: e.name })));
    }
  }, [eventsEnabled]);

  useEffect(() => {
    loadAccounts();
    loadEvents();
  }, [loadAccounts, loadEvents]);

  const formMethods = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema) as Resolver<TransactionFormValues>,
  });

  useEffect(() => {
    if (editingTransaction) {
      formMethods.reset({
        type: editingTransaction.type as TransactionType.INCOME | TransactionType.EXPENSE,
        date: editingTransaction.date,
        value: Number(editingTransaction.value) || 0,
        description: editingTransaction.description || "",
        categoryId: editingTransaction.categoryId || "",
        sourceAccountId: editingTransaction.sourceAccountId || null,
        destinationAccountId: editingTransaction.destinationAccountId || null,
        paymentMethod: editingTransaction.paymentMethod || null,
        eventId: editingTransaction.eventId || null,
      });
    } else {
      formMethods.reset({
        type: TransactionType.INCOME,
        date: todayISODate(),
        value: undefined as unknown as number,
        description: "",
        categoryId: "",
        sourceAccountId: null,
        destinationAccountId: null,
        paymentMethod: null,
        eventId: null,
      });
    }
  }, [editingTransaction, isModalOpen, formMethods]);

  const getCategoryName = useCallback(
    (id?: string | null) => {
      if (!id) return "-";
      return categories.find((c) => c.id === id)?.name || id;
    },
    [categories],
  );

  const getAccountName = useCallback(
    (id?: string | null) => {
      if (!id) return "-";
      return accounts.find((a) => a.id === id)?.name || id;
    },
    [accounts],
  );

  const getEventName = useCallback(
    (id?: string | null) => {
      if (!id) return null;
      return events.find((e) => e.id === id)?.name || id;
    },
    [events],
  );

  const handleFilterChange = (field: keyof IFinancialFilters, value: string) => {
    list.setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    list.setFilters(initialFilters);
  };

  const refreshList = () => {
    list.reload();
    void loadTotals(list.filters);
  };

  const handleOpenModal = (transaction?: Transaction) => {
    setEditingTransaction(transaction || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleViewDetails = (transaction: Transaction) => {
    setViewingTransaction(transaction);
  };

  const handleCloseDetails = () => {
    setViewingTransaction(null);
  };

  const handleSaveTransaction = async (data: TransactionFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        type: data.type,
        date: data.date,
        value: data.value,
        description: data.description,
        categoryId: data.categoryId || null,
        sourceAccountId: data.sourceAccountId || null,
        destinationAccountId: data.destinationAccountId || null,
        paymentMethod: data.paymentMethod || null,
        eventId: data.eventId || null,
      };

      if (editingTransaction) {
        const result = await transactionsService.update(editingTransaction.id, payload);
        if (result.error) {
          toastError(result.error);
        } else {
          refreshList();
          handleCloseModal();
          success("Movimentação atualizada com sucesso!");
        }
      } else {
        const result = await transactionsService.create(payload);
        if (result.error) {
          toastError(result.error);
        } else {
          refreshList();
          handleCloseModal();
          success("Movimentação criada com sucesso!");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro interno";
      toastError(message);
    }
    setIsSaving(false);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;

    setIsDeleting(true);
    const result = await transactionsService.cancel(transactionToDelete);
    if (result.error) {
      toastError(result.error);
    } else {
      refreshList();
      success("Movimentação cancelada com sucesso!");
    }
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    setTransactionToDelete(null);
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    }
  };

  const presentationProps: IFinancialPresentationProps = {
    transactions: list.items as Transaction[],
    totals,
    filters: list.filters,
    onFilterChange: handleFilterChange,
    onClearFilters: handleClearFilters,
    onOpenModal: handleOpenModal,
    onDeleteTransaction: handleDeleteTransaction,
    onViewDetails: handleViewDetails,
    isModalOpen,
    onCloseModal: handleCloseModal,
    editingTransaction,
    viewingTransaction,
    onCloseDetails: handleCloseDetails,
    formMethods,
    onSave: handleSaveTransaction,
    isLoading: list.loading || isSaving,
    categories,
    accounts,
    events,
    eventsEnabled,
    isDeleteModalOpen,
    onCloseDeleteModal: handleCloseDeleteModal,
    onConfirmDelete: handleConfirmDelete,
    isDeleting,
    getCategoryName,
    getAccountName,
    getEventName,
    page: list.page,
    pageSize: list.pageSize,
    totalItems: list.total,
    totalPages: list.totalPages,
    onPageChange: list.setPage,
    onPageSizeChange: list.setPageSize,
  };

  return <FinancialPresentation {...presentationProps} />;
}
