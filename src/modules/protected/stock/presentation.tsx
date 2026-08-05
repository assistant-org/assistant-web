import React, { useState } from "react";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import BottomSheet from "../../../shared/components/BottomSheet";
import FilterButton from "../../../shared/components/FilterButton";
import FilterPopover from "../../../shared/components/filters/FilterPopover";
import FilterBadges, { FilterBadgeChip } from "../../../shared/components/filters/FilterBadges";
import FormShell from "../../../shared/components/FormShell";
import PaginationControls from "../../../shared/components/PaginationControls";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { StockBatchStatus } from "../../../shared/services/stock/types";
import { IStockFilters, IStockPresentationProps } from "./types";
import StockSummaryCards from "./components/StockSummaryCards";
import StockFilters, { STATUS_FILTER_OPTIONS } from "./components/StockFilters";
import BatchTable from "./components/BatchTable";
import BatchCard from "./components/BatchCard";
import BatchDetails from "./components/BatchDetails";
import StockMovementWizard from "./components/wizard/StockMovementWizard";

export default function StockPresentation({
  products,
  batches,
  allBatches,
  summaries,
  filters,
  onFilterChange,
  onClearFilters,
  onOpenMovementModal,
  isMovementModalOpen,
  onCloseMovementModal,
  movementFormMethods,
  onSaveMovement,
  isSavingMovement,
  isDetailsModalOpen,
  selectedBatch,
  onOpenDetails,
  onCloseDetails,
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: IStockPresentationProps) {
  const isMobile = useMediaQuery("(max-width: 700px)");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  const hasActiveFilters = Boolean(
    filters.productId ||
      filters.expiryBefore ||
      (filters.status && filters.status !== StockBatchStatus.ACTIVE),
  );

  const handleTempFilterChange = (key: keyof IStockFilters, value: string) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    Object.entries(tempFilters).forEach(([key, value]) => {
      onFilterChange(key as keyof IStockFilters, value as string);
    });
    setIsFilterSheetOpen(false);
    setIsFilterPopoverOpen(false);
  };

  const handleClearFilters = () => {
    onClearFilters();
    setTempFilters({
      productId: "",
      status: StockBatchStatus.ACTIVE,
      expiryBefore: "",
    });
    setIsFilterSheetOpen(false);
    setIsFilterPopoverOpen(false);
  };

  const filterChips: FilterBadgeChip[] = [];
  if (filters.productId) {
    const name = products.find((p) => p.id === filters.productId)?.name || filters.productId;
    filterChips.push({
      key: "product",
      label: `Produto: ${name}`,
      onRemove: () => onFilterChange("productId", ""),
    });
  }
  if (filters.status && filters.status !== StockBatchStatus.ACTIVE) {
    const label =
      STATUS_FILTER_OPTIONS.find((o) => o.value === filters.status)?.label || filters.status;
    filterChips.push({
      key: "status",
      label: `Status: ${label}`,
      onRemove: () => onFilterChange("status", StockBatchStatus.ACTIVE),
    });
  }
  if (filters.expiryBefore) {
    filterChips.push({
      key: "expiry",
      label: `Validade até: ${filters.expiryBefore}`,
      onRemove: () => onFilterChange("expiryBefore", ""),
    });
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Estoque</h1>
        <Button onClick={onOpenMovementModal}>+ Nova Movimentação</Button>
      </div>

      <StockSummaryCards summaries={summaries} />

      <div className="flex justify-end mb-3">
        {isMobile ? (
          <FilterButton
            onClick={() => {
              setTempFilters(filters);
              setIsFilterSheetOpen(true);
            }}
            hasActiveFilters={hasActiveFilters}
          />
        ) : (
          <FilterPopover
            isOpen={isFilterPopoverOpen}
            onOpenChange={(open) => {
              if (open) setTempFilters(filters);
              setIsFilterPopoverOpen(open);
            }}
            hasActiveFilters={hasActiveFilters}
          >
            <StockFilters
              filters={tempFilters}
              onFilterChange={handleTempFilterChange}
              onApply={handleApplyFilters}
              onClearFilters={handleClearFilters}
              products={products}
              hasActiveFilters={hasActiveFilters}
            />
          </FilterPopover>
        )}
      </div>

      <FilterBadges chips={filterChips} />

      <Card className={isMobile ? "!p-0 overflow-hidden" : ""}>
        {isMobile ? (
          <BatchCard batches={batches} onViewDetails={onOpenDetails} />
        ) : (
          <BatchTable batches={batches} onViewDetails={onOpenDetails} />
        )}
      </Card>

      <PaginationControls
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      <StockMovementWizard
        isOpen={isMovementModalOpen}
        onClose={onCloseMovementModal}
        formMethods={movementFormMethods}
        onSave={onSaveMovement}
        isLoading={isSavingMovement}
        products={products}
        batches={allBatches}
      />

      {selectedBatch && (
        <FormShell
          isOpen={isDetailsModalOpen}
          onClose={onCloseDetails}
          title="Detalhes do Lote"
        >
          <BatchDetails batch={selectedBatch} />
        </FormShell>
      )}

      <BottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="Filtros"
      >
        <StockFilters
          filters={tempFilters}
          onFilterChange={handleTempFilterChange}
          onApply={handleApplyFilters}
          onClearFilters={handleClearFilters}
          products={products}
          hasActiveFilters={hasActiveFilters}
        />
      </BottomSheet>
    </div>
  );
}
