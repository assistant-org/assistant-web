import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import StockPresentation from "./presentation";
import { stockFormSchema, StockFormValues } from "./schema";
import { IProductSummary, IStockFilters, IStockPresentationProps } from "./types";
import { productsService } from "../../../shared/services/products/products.service";
import { Product } from "../../../shared/services/products/types";
import { stockBatchesService } from "../../../shared/services/stock/stockBatches.service";
import { stockMovementsService } from "../../../shared/services/stock/stockMovements.service";
import { eventsService } from "../../../shared/services/events/events.service";
import {
  StockBatch,
  StockBatchStatus,
  StockMovementType,
} from "../../../shared/services/stock/types";
import { useToast } from "../../../shared/context/ToastContext";
import { useServerList } from "../../../shared/hooks/useServerList";
import { todayISODate } from "../../../shared/utils/formatDate";

const initialFilters: IStockFilters = {
  productId: "",
  status: StockBatchStatus.ACTIVE,
  expiryBefore: "",
};

interface IEventOption {
  id: string;
  name: string;
}

function emptyForm(): StockFormValues {
  return {
    type: StockMovementType.ENTRY,
    mode: "individual",
    eventId: "",
    items: [
      {
        productId: "",
        batchId: null,
        quantity: undefined as unknown as number,
        unitValue: 0,
        availableQuantity: null,
      },
    ],
    date: todayISODate(),
    entryDate: todayISODate(),
    expiryDate: null,
    observations: null,
    reason: null,
    direction: null,
  };
}

export default function StockContainer() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allBatches, setAllBatches] = useState<StockBatch[]>([]);
  const [events, setEvents] = useState<IEventOption[]>([]);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isSavingMovement, setIsSavingMovement] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<StockBatch | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);
  const [sellerNotifyOpen, setSellerNotifyOpen] = useState(false);
  const [sellerNotifyLines, setSellerNotifyLines] = useState<
    { productName: string; quantity: number }[]
  >([]);
  const [sellerNotifyDate, setSellerNotifyDate] = useState<string | null>(null);

  const { success, error: toastError } = useToast();

  const fetchBatches = useCallback(
    async (params: IStockFilters & { page: number; pageSize: number }) => {
      const { page, pageSize, ...filters } = params;
      return stockBatchesService.findPage({
        productId: filters.productId || undefined,
        status: filters.status,
        expiryBefore: filters.expiryBefore || undefined,
        page,
        pageSize,
      });
    },
    [],
  );

  const list = useServerList(fetchBatches, {
    initialFilters,
    initialPageSize: 10,
  });

  useEffect(() => {
    if (list.error) toastError(list.error);
  }, [list.error, toastError]);

  const loadProducts = useCallback(async () => {
    const result = await productsService.findAll({
      includeInactive: false,
      trackStockOnly: true,
    });
    if (result.error) toastError(result.error);
    else setProducts(result.data || []);
  }, [toastError]);

  const loadAllBatches = useCallback(async () => {
    const result = await stockBatchesService.findAll();
    if (result.error) toastError(result.error);
    else setAllBatches(result.data || []);
  }, [toastError]);

  const loadEvents = useCallback(async () => {
    const result = await eventsService.findAll();
    if (result.error) {
      toastError(result.error);
      return;
    }
    const items = Array.isArray(result.data) ? result.data : [];
    setEvents(
      items
        .filter((e: { id?: string }) => e.id)
        .map((e: { id?: string; name: string }) => ({
          id: String(e.id),
          name: e.name,
        })),
    );
  }, [toastError]);

  useEffect(() => {
    loadProducts();
    loadAllBatches();
    loadEvents();
  }, [loadProducts, loadAllBatches, loadEvents]);

  const movementFormMethods = useForm<StockFormValues>({
    resolver: zodResolver(stockFormSchema) as Resolver<StockFormValues>,
    defaultValues: emptyForm(),
  });

  useEffect(() => {
    if (isMovementModalOpen) {
      movementFormMethods.reset(emptyForm());
    }
  }, [isMovementModalOpen, movementFormMethods]);

  const summaries: IProductSummary[] = useMemo(() => {
    const map = new Map<string, IProductSummary>();
    for (const batch of allBatches) {
      if (batch.status !== StockBatchStatus.ACTIVE) continue;
      const existing = map.get(batch.productId);
      if (existing) {
        existing.totalAvailable += batch.availableQuantity;
      } else {
        map.set(batch.productId, {
          productId: batch.productId,
          productName: batch.productName || batch.productId,
          totalAvailable: batch.availableQuantity,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.productName.localeCompare(b.productName),
    );
  }, [allBatches]);

  const handleFilterChange = (field: keyof IStockFilters, value: string) => {
    list.setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => list.setFilters(initialFilters);

  const refresh = () => {
    list.reload();
    void loadAllBatches();
  };

  const handleOpenDetails = async (batch: StockBatch) => {
    const result = await stockBatchesService.findById(batch.id);
    if (result.error || !result.data) {
      toastError(result.error || "Lote não encontrado");
    } else {
      setSelectedBatch(result.data);
      setIsDetailsModalOpen(true);
    }
  };

  const handleSaveMovement = async (data: StockFormValues) => {
    setIsSavingMovement(true);
    try {
      const items = data.items || [];
      if (items.length === 0) {
        toastError("Adicione pelo menos um item");
        setIsSavingMovement(false);
        return;
      }

      const operationGroupId =
        items.length > 1 ? crypto.randomUUID() : null;

      for (const item of items) {
        if (data.type === StockMovementType.ENTRY) {
          const product = products.find((p) => p.id === item.productId);
          const result = await stockMovementsService.create({
            type: StockMovementType.ENTRY,
            productId: item.productId,
            quantity: item.quantity,
            unitValue: product?.defaultUnitValue ?? item.unitValue ?? 0,
            entryDate: data.entryDate || todayISODate(),
            expiryDate: data.expiryDate || null,
            observations: data.observations || null,
            reason: data.reason || null,
            eventId: data.eventId || null,
            operationGroupId,
          });
          if (result.error) {
            toastError(result.error);
            setIsSavingMovement(false);
            return;
          }
        } else {
          const result = await stockMovementsService.create({
            type: data.type as
              | StockMovementType.EXIT
              | StockMovementType.LOSS
              | StockMovementType.INTERNAL_CONSUMPTION,
            productId: item.productId,
            batchId: item.batchId!,
            quantity: item.quantity,
            date: data.date || todayISODate(),
            reason: data.reason || data.observations || null,
            eventId: data.eventId || null,
            operationGroupId,
          });
          if (result.error) {
            toastError(result.error);
            setIsSavingMovement(false);
            return;
          }
        }
      }

      refresh();
      setIsMovementModalOpen(false);
      success(
        items.length > 1
          ? "Movimentação em lote registrada com sucesso!"
          : "Movimentação registrada com sucesso!",
      );

      if (data.type === StockMovementType.ENTRY) {
        setSellerNotifyLines(
          items.map((item) => ({
            productName:
              products.find((p) => p.id === item.productId)?.name ||
              "Produto",
            quantity: item.quantity,
          })),
        );
        setSellerNotifyDate(data.entryDate || todayISODate());
        setSellerNotifyOpen(true);
      }
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Erro interno");
    }
    setIsSavingMovement(false);
  };

  const handleSaveBatchEdit = async (updates: {
    expiryDate?: string | null;
    observations?: string | null;
    unitValue?: number;
  }) => {
    if (!selectedBatch) return;
    const result = await stockBatchesService.update(selectedBatch.id, updates);
    if (result.error) {
      toastError(result.error);
      return;
    }
    setSelectedBatch(result.data);
    setIsEditModalOpen(false);
    refresh();
    success("Lote atualizado com sucesso!");
  };

  const handleConfirmDeleteBatch = async () => {
    if (!selectedBatch) return;
    setIsDeletingBatch(true);
    const result = await stockBatchesService.delete(selectedBatch.id);
    setIsDeletingBatch(false);
    if (result.error) {
      toastError(result.error);
      return;
    }
    setIsDeleteModalOpen(false);
    setIsEditModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedBatch(null);
    refresh();
    success("Lote excluído com sucesso!");
  };

  const presentationProps: IStockPresentationProps = {
    products,
    batches: list.items,
    allBatches,
    events,
    summaries,
    filters: list.filters,
    onFilterChange: handleFilterChange,
    onClearFilters: handleClearFilters,
    onOpenMovementModal: () => setIsMovementModalOpen(true),
    isMovementModalOpen,
    onCloseMovementModal: () => setIsMovementModalOpen(false),
    movementFormMethods,
    onSaveMovement: handleSaveMovement,
    isSavingMovement,
    isDetailsModalOpen,
    selectedBatch,
    onOpenDetails: handleOpenDetails,
    onCloseDetails: () => {
      setIsDetailsModalOpen(false);
      setSelectedBatch(null);
    },
    onOpenEdit: (batch) => {
      setSelectedBatch(batch);
      setIsDetailsModalOpen(false);
      setIsEditModalOpen(true);
    },
    isEditModalOpen,
    onCloseEdit: () => {
      setIsEditModalOpen(false);
      setSelectedBatch(null);
    },
    onSaveBatchEdit: handleSaveBatchEdit,
    isDeleteModalOpen,
    onOpenDelete: (batch: StockBatch) => {
      setSelectedBatch(batch);
      setIsDeleteModalOpen(true);
    },
    onCloseDelete: () => setIsDeleteModalOpen(false),
    onConfirmDelete: handleConfirmDeleteBatch,
    isDeletingBatch,
    sellerNotifyOpen,
    sellerNotifyLines,
    sellerNotifyDate,
    onCloseSellerNotify: () => setSellerNotifyOpen(false),
    isLoading: list.loading,
    isListLoading: list.loading,
    page: list.page,
    pageSize: list.pageSize,
    totalItems: list.total,
    totalPages: list.totalPages,
    onPageChange: list.setPage,
    onPageSizeChange: list.setPageSize,
  };

  return <StockPresentation {...presentationProps} />;
}
