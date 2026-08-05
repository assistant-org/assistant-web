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
import {
  StockBatch,
  StockBatchStatus,
  StockMovementType,
} from "../../../shared/services/stock/types";
import { useToast } from "../../../shared/context/ToastContext";
import { useServerList } from "../../../shared/hooks/useServerList";

const today = () => new Date().toISOString().split("T")[0];

const initialFilters: IStockFilters = {
  productId: "",
  status: StockBatchStatus.ACTIVE,
  expiryBefore: "",
};

export default function StockContainer() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allBatches, setAllBatches] = useState<StockBatch[]>([]);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isSavingMovement, setIsSavingMovement] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<StockBatch | null>(null);

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
    if (result.error) {
      toastError(result.error);
    } else {
      setProducts(result.data || []);
    }
  }, [toastError]);

  const loadAllBatches = useCallback(async () => {
    const result = await stockBatchesService.findAll();
    if (result.error) {
      toastError(result.error);
    } else {
      setAllBatches(result.data || []);
    }
  }, [toastError]);

  useEffect(() => {
    loadProducts();
    loadAllBatches();
  }, [loadProducts, loadAllBatches]);

  const movementFormMethods = useForm<StockFormValues>({
    resolver: zodResolver(stockFormSchema) as Resolver<StockFormValues>,
    defaultValues: {
      type: StockMovementType.ENTRY,
      productId: "",
      batchId: null,
      quantity: undefined,
      date: today(),
      entryDate: today(),
      unitValue: 0,
      expiryDate: null,
      observations: null,
      reason: null,
      direction: null,
    },
  });

  useEffect(() => {
    if (isMovementModalOpen) {
      movementFormMethods.reset({
        type: StockMovementType.ENTRY,
        productId: "",
        batchId: null,
        quantity: undefined,
        date: today(),
        entryDate: today(),
        unitValue: 0,
        expiryDate: null,
        observations: null,
        reason: null,
        direction: null,
      });
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
      if (data.type === StockMovementType.ENTRY) {
        const result = await stockMovementsService.create({
          type: StockMovementType.ENTRY,
          productId: data.productId,
          quantity: data.quantity!,
          unitValue: data.unitValue ?? 0,
          entryDate: data.entryDate || today(),
          expiryDate: data.expiryDate || null,
          observations: data.observations || data.reason || null,
          reason: data.reason || null,
        });
        if (result.error) {
          toastError(result.error);
        } else {
          refresh();
          setIsMovementModalOpen(false);
          success("Entrada registrada com sucesso!");
        }
      } else {
        const result = await stockMovementsService.create({
          type: data.type as
            | StockMovementType.EXIT
            | StockMovementType.LOSS
            | StockMovementType.INTERNAL_CONSUMPTION,
          productId: data.productId,
          batchId: data.batchId!,
          quantity: data.quantity!,
          date: data.date || today(),
          reason: data.reason || data.observations || null,
        });
        if (result.error) {
          toastError(result.error);
        } else {
          refresh();
          setIsMovementModalOpen(false);
          success("Movimentação registrada com sucesso!");
        }
      }
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Erro interno");
    }
    setIsSavingMovement(false);
  };

  const presentationProps: IStockPresentationProps = {
    products,
    batches: list.items,
    allBatches,
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
    isLoading: list.loading,
    page: list.page,
    pageSize: list.pageSize,
    totalItems: list.total,
    totalPages: list.totalPages,
    onPageChange: list.setPage,
    onPageSizeChange: list.setPageSize,
  };

  return <StockPresentation {...presentationProps} />;
}
