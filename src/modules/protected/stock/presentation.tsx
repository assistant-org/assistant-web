import React, { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import BottomSheet from "../../../shared/components/BottomSheet";
import FilterButton from "../../../shared/components/FilterButton";
import FilterPopover from "../../../shared/components/filters/FilterPopover";
import FilterBadges, { FilterBadgeChip } from "../../../shared/components/filters/FilterBadges";
import FormShell from "../../../shared/components/FormShell";
import DeleteModal from "../../../shared/components/DeleteModal";
import PaginationControls from "../../../shared/components/PaginationControls";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { StockBatchStatus } from "../../../shared/services/stock/types";
import { IStockFilters, IStockPresentationProps } from "./types";
import StockSummaryCards from "./components/StockSummaryCards";
import StockFilters, { STATUS_FILTER_OPTIONS } from "./components/StockFilters";
import BatchTable from "./components/BatchTable";
import BatchCard from "./components/BatchCard";
import BatchDetails from "./components/BatchDetails";
import BatchEditSummary from "./components/BatchEditSummary";
import StockMovementWizard from "./components/wizard/StockMovementWizard";

export default function StockPresentation(props: IStockPresentationProps) {
  const {
    products,
    batches,
    allBatches,
    events,
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
    onOpenEdit,
    isEditModalOpen,
    onCloseEdit,
    onSaveBatchEdit,
    isDeleteModalOpen,
    onOpenDelete,
    onCloseDelete,
    onConfirmDelete,
    isDeletingBatch,
    page,
    pageSize,
    totalItems,
    totalPages,
    onPageChange,
    onPageSizeChange,
  } = props;

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

  const handleClearFiltersLocal = () => {
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
      key: "productId",
      label: `Produto: ${name}`,
      onRemove: () => onFilterChange("productId", ""),
    });
  }
  if (filters.status && filters.status !== StockBatchStatus.ACTIVE) {
    const label =
      STATUS_FILTER_OPTIONS.find((o) => o.value === filters.status)?.label ||
      String(filters.status);
    filterChips.push({
      key: "status",
      label: `Status: ${label}`,
      onRemove: () => onFilterChange("status", StockBatchStatus.ACTIVE),
    });
  }
  if (filters.expiryBefore) {
    filterChips.push({
      key: "expiryBefore",
      label: `Validade até: ${filters.expiryBefore}`,
      onRemove: () => onFilterChange("expiryBefore", ""),
    });
  }

  const resolveEventName = (id?: string | null) =>
    events.find((e) => e.id === id)?.name || id || null;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Estoque</h1>
        <div className="flex items-center gap-2">
          <Link
            to="/stock/history"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 px-2"
          >
            Histórico
          </Link>
          {isMobile ? (
            <FilterButton
              hasActiveFilters={hasActiveFilters}
              onClick={() => {
                setTempFilters(filters);
                setIsFilterSheetOpen(true);
              }}
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
                onClearFilters={handleClearFiltersLocal}
                products={products}
                hasActiveFilters={hasActiveFilters}
              />
            </FilterPopover>
          )}
          <Button onClick={onOpenMovementModal}>+ Movimentação</Button>
        </div>
      </div>

      <StockSummaryCards summaries={summaries} />

      {filterChips.length > 0 && (
        <div className="mb-4">
          <FilterBadges chips={filterChips} />
        </div>
      )}

      <Card className={isMobile ? "!p-0 overflow-hidden" : ""}>
        {isMobile ? (
          <BatchCard
            batches={batches}
            onViewDetails={onOpenDetails}
            onEdit={onOpenEdit}
          />
        ) : (
          <BatchTable
            batches={batches}
            onViewDetails={onOpenDetails}
            onEdit={onOpenEdit}
          />
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
        events={events}
      />

      {selectedBatch && (
        <FormShell
          isOpen={isDetailsModalOpen}
          onClose={onCloseDetails}
          title="Detalhes do Lote"
          footer={
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onCloseDetails}>
                Fechar
              </Button>
            </div>
          }
        >
          <BatchDetails
            batch={selectedBatch}
            eventName={resolveEventName(selectedBatch.eventId)}
            resolveEventName={resolveEventName}
          />
        </FormShell>
      )}

      {selectedBatch && (
        <BatchEditSummary
          isOpen={isEditModalOpen}
          batch={selectedBatch}
          onClose={onCloseEdit}
          onSave={onSaveBatchEdit}
          onDelete={onOpenDelete}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={onCloseDelete}
        onConfirm={onConfirmDelete}
        title="Excluir chopp"
        message={
          selectedBatch
            ? `Tem certeza que deseja excluir o lote #${selectedBatch.id} (${selectedBatch.productName || "produto"})? Todas as movimentações vinculadas serão removidas.`
            : "Tem certeza que deseja excluir este lote?"
        }
        isDeleting={isDeletingBatch}
      />

      <BottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="Filtros"
      >
        <StockFilters
          filters={tempFilters}
          onFilterChange={handleTempFilterChange}
          onApply={handleApplyFilters}
          onClearFilters={handleClearFiltersLocal}
          products={products}
          hasActiveFilters={hasActiveFilters}
        />
      </BottomSheet>
    </div>
  );
}
