import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { productsService } from "../../../shared/services/products/products.service";
import { Product } from "../../../shared/services/products/types";
import { stockMovementsService } from "../../../shared/services/stock/stockMovements.service";
import { StockMovementOrigin, StockMovementType } from "../../../shared/services/stock/types";
import {
  COMPRA_DE_CHOPP_CATEGORY_NAME,
  isCompraDeChoppCategory,
} from "./components/wizard/steps";
import { useServerList } from "../../../shared/hooks/useServerList";

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

const today = () => new Date().toISOString().split("T")[0];

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
  const [products, setProducts] = useState<Product[]>([]);
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

  const { categories, loading: categoriesLoading, createCategory } = useCategories();
  const { success, error: toastError } = useToast();
  const choppSeededRef = useRef(false);

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

  const loadProducts = useCallback(async () => {
    const result = await productsService.findAll({ trackStockOnly: true });
    if (result.data) setProducts(result.data.filter((p) => p.active));
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
    loadProducts();
    loadEvents();
  }, [loadAccounts, loadProducts, loadEvents]);

  useEffect(() => {
    if (categoriesLoading || choppSeededRef.current) return;
    const exists = categories.some((c) => c.name === COMPRA_DE_CHOPP_CATEGORY_NAME);
    if (exists) {
      choppSeededRef.current = true;
      return;
    }
    choppSeededRef.current = true;
    void createCategory({
      name: COMPRA_DE_CHOPP_CATEGORY_NAME,
      type: "EXPENSE",
      status: true,
      description: "Compra de chopp — gera entrada de estoque automaticamente",
    });
  }, [categories, categoriesLoading, createCategory]);

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
        stockProductId: null,
        stockQuantityLiters: null,
        stockUnitValue: null,
        stockExpiryDate: null,
      });
    } else {
      formMethods.reset({
        type: TransactionType.INCOME,
        date: today(),
        value: undefined as unknown as number,
        description: "",
        categoryId: "",
        sourceAccountId: null,
        destinationAccountId: null,
        paymentMethod: null,
        eventId: null,
        stockProductId: null,
        stockQuantityLiters: null,
        stockUnitValue: null,
        stockExpiryDate: null,
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
      const selectedCategory = categories.find(
        (c) => String(c.id) === String(data.categoryId),
      );
      const isChoppPurchase =
        data.type === TransactionType.EXPENSE &&
        (isCompraDeChoppCategory(selectedCategory) ||
          isCompraDeChoppCategory({ id: data.categoryId }));

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
          setIsSaving(false);
          return;
        }

        const created = result.data;
        if (isChoppPurchase && created?.id) {
          const liters = data.stockQuantityLiters ?? 0;
          const unitValue = data.stockUnitValue ?? 0;
          const stockResult = await stockMovementsService.create({
            type: StockMovementType.ENTRY,
            productId: data.stockProductId!,
            quantity: liters,
            unitValue,
            entryDate: data.date,
            expiryDate: data.stockExpiryDate || null,
            observations: data.description || null,
            origin: StockMovementOrigin.TRANSACTION,
            originId: created.id,
          });

          if (stockResult.error) {
            await transactionsService.cancel(created.id);
            toastError(
              `Movimentação financeira cancelada: falha ao criar entrada de estoque (${stockResult.error})`,
            );
            refreshList();
            setIsSaving(false);
            return;
          }
        }

        refreshList();
        handleCloseModal();
        success(
          isChoppPurchase
            ? "Despesa e entrada de estoque criadas com sucesso!"
            : "Movimentação criada com sucesso!",
        );
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
    products,
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
