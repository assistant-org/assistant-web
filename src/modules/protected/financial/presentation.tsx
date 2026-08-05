import React, { useState } from "react";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import FormShell from "../../../shared/components/FormShell";
import DeleteModal from "../../../shared/components/DeleteModal";
import BottomSheet from "../../../shared/components/BottomSheet";
import FilterButton from "../../../shared/components/FilterButton";
import PaginationControls from "../../../shared/components/PaginationControls";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { TransactionStatus } from "../../../shared/services/transactions/types";
import TransactionWizard from "./components/wizard/TransactionWizard";
import TransactionFilters, {
  ORIGIN_OPTIONS,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
} from "./components/TransactionFilters";
import FilterPopover from "../../../shared/components/filters/FilterPopover";
import FilterBadges, { FilterBadgeChip } from "../../../shared/components/filters/FilterBadges";
import TransactionTable from "./components/TransactionTable";
import TransactionCard from "./components/TransactionCard";
import TransactionDetails from "./components/TransactionDetails";
import { IFinancialFilters, IFinancialPresentationProps } from "./types";

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function FinancialPresentation({
  transactions,
  totals,
  filters,
  onFilterChange,
  onClearFilters,
  onOpenModal,
  onDeleteTransaction,
  onViewDetails,
  isModalOpen,
  onCloseModal,
  editingTransaction,
  viewingTransaction,
  onCloseDetails,
  formMethods,
  onSave,
  isLoading,
  categories,
  accounts,
  products,
  events,
  eventsEnabled,
  isDeleteModalOpen,
  onCloseDeleteModal,
  onConfirmDelete,
  isDeleting,
  getCategoryName,
  getAccountName,
  getEventName,
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: IFinancialPresentationProps) {
  const isMobile = useMediaQuery("(max-width: 700px)");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  const hasActiveFilters = Boolean(
    filters.startDate ||
      filters.endDate ||
      filters.type ||
      filters.categoryId ||
      filters.accountId ||
      filters.origin ||
      filters.eventId ||
      (filters.status && filters.status !== TransactionStatus.ACTIVE),
  );

  const handleTempFilterChange = (key: keyof IFinancialFilters, value: string) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    Object.entries(tempFilters).forEach(([key, value]) => {
      onFilterChange(key as keyof IFinancialFilters, value as string);
    });
    setIsFilterSheetOpen(false);
    setIsFilterPopoverOpen(false);
  };

  const handleClearFilters = () => {
    onClearFilters();
    setIsFilterSheetOpen(false);
    setIsFilterPopoverOpen(false);
  };

  const openFilterSheet = () => {
    setTempFilters(filters);
    setIsFilterSheetOpen(true);
  };

  const handleFilterPopoverOpenChange = (open: boolean) => {
    if (open) setTempFilters(filters);
    setIsFilterPopoverOpen(open);
  };

  const handleRemoveFilter = (field: keyof IFinancialFilters) => {
    const resetValue = field === "status" ? TransactionStatus.ACTIVE : "";
    onFilterChange(field, resetValue);
  };

  const filterChips: FilterBadgeChip[] = [];
  if (filters.startDate || filters.endDate) {
    const range = [filters.startDate, filters.endDate].filter(Boolean).join(" até ");
    filterChips.push({
      key: "period",
      label: `Período: ${range}`,
      onRemove: () => {
        handleRemoveFilter("startDate");
        handleRemoveFilter("endDate");
      },
    });
  }
  if (filters.type) {
    const label = TYPE_OPTIONS.find((o) => o.value === filters.type)?.label || filters.type;
    filterChips.push({
      key: "type",
      label: `Tipo: ${label}`,
      onRemove: () => handleRemoveFilter("type"),
    });
  }
  if (filters.categoryId) {
    const name =
      categories.find((c) => c.id === filters.categoryId)?.name || filters.categoryId;
    filterChips.push({
      key: "category",
      label: `Categoria: ${name}`,
      onRemove: () => handleRemoveFilter("categoryId"),
    });
  }
  if (filters.accountId) {
    const name = accounts.find((a) => a.id === filters.accountId)?.name || filters.accountId;
    filterChips.push({
      key: "account",
      label: `Conta: ${name}`,
      onRemove: () => handleRemoveFilter("accountId"),
    });
  }
  if (filters.origin) {
    const label =
      ORIGIN_OPTIONS.find((o) => o.value === filters.origin)?.label || filters.origin;
    filterChips.push({
      key: "origin",
      label: `Origem: ${label}`,
      onRemove: () => handleRemoveFilter("origin"),
    });
  }
  if (filters.eventId) {
    const name = events.find((e) => e.id === filters.eventId)?.name || filters.eventId;
    filterChips.push({
      key: "event",
      label: `Evento: ${name}`,
      onRemove: () => handleRemoveFilter("eventId"),
    });
  }
  if (filters.status && filters.status !== TransactionStatus.ACTIVE) {
    const label =
      STATUS_OPTIONS.find((o) => o.value === filters.status)?.label || filters.status;
    filterChips.push({
      key: "status",
      label: `Status: ${label}`,
      onRemove: () => handleRemoveFilter("status"),
    });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financeiro</h1>
        <Button onClick={() => onOpenModal()}>+ Nova Movimentação</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="!p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            Receitas
          </p>
          <p className="mt-1 text-xl font-semibold text-green-600 dark:text-green-400">
            {formatCurrency(totals.income)}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            Despesas
          </p>
          <p className="mt-1 text-xl font-semibold text-red-600 dark:text-red-400">
            {formatCurrency(totals.expense)}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            Resultado
          </p>
          <p
            className={`mt-1 text-xl font-semibold ${
              totals.balance >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatCurrency(totals.balance)}
          </p>
        </Card>
      </div>

      <div className="flex justify-end mb-3">
        {isMobile ? (
          <FilterButton onClick={openFilterSheet} hasActiveFilters={hasActiveFilters} />
        ) : (
          <FilterPopover
            isOpen={isFilterPopoverOpen}
            onOpenChange={handleFilterPopoverOpenChange}
            hasActiveFilters={hasActiveFilters}
          >
            <TransactionFilters
              filters={tempFilters}
              onFilterChange={handleTempFilterChange}
              onApply={handleApplyFilters}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
              categories={categories}
              accounts={accounts}
              events={events}
              eventsEnabled={eventsEnabled}
            />
          </FilterPopover>
        )}
      </div>

      <FilterBadges chips={filterChips} />

      <Card className={isMobile ? "!p-0 overflow-hidden" : ""}>
        {isMobile ? (
          <TransactionCard
            transactions={transactions}
            onEdit={onOpenModal}
            onDelete={onDeleteTransaction}
            onViewDetails={onViewDetails}
            getCategoryName={getCategoryName}
            getAccountName={getAccountName}
          />
        ) : (
          <TransactionTable
            transactions={transactions}
            onEdit={onOpenModal}
            onDelete={onDeleteTransaction}
            onViewDetails={onViewDetails}
            getCategoryName={getCategoryName}
            getAccountName={getAccountName}
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

      <TransactionWizard
        isOpen={isModalOpen}
        onClose={onCloseModal}
        isEditing={!!editingTransaction}
        formMethods={formMethods}
        onSave={onSave}
        isLoading={isLoading}
        categories={categories}
        accounts={accounts}
        products={products}
        events={events}
        eventsEnabled={eventsEnabled}
      />

      {viewingTransaction && (
        <FormShell
          isOpen={!!viewingTransaction}
          onClose={onCloseDetails}
          title="Detalhes da Movimentação"
        >
          <TransactionDetails
            transaction={viewingTransaction}
            onClose={onCloseDetails}
            getCategoryName={getCategoryName}
            getAccountName={getAccountName}
            getEventName={getEventName}
          />
        </FormShell>
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
        title="Cancelar Movimentação"
        message="Tem certeza que deseja cancelar esta movimentação"
        isDeleting={isDeleting}
      />

      <BottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="Filtros"
      >
        <TransactionFilters
          filters={tempFilters}
          onFilterChange={handleTempFilterChange}
          onApply={handleApplyFilters}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          categories={categories}
          accounts={accounts}
          events={events}
          eventsEnabled={eventsEnabled}
        />
      </BottomSheet>
    </div>
  );
}
