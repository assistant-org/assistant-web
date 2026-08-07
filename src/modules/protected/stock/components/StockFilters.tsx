import React, { useState } from "react";
import Button from "../../../../shared/components/Button";
import FilterAccordionSection from "../../../../shared/components/filters/FilterAccordionSection";
import { Product } from "../../../../shared/services/products/types";
import { StockBatchStatus } from "../../../../shared/services/stock/types";
import { IStockFilters } from "../types";

const inputBaseClasses =
  "block w-full min-h-11 rounded-md border px-3 py-2 text-base shadow-sm focus:outline-none sm:min-h-0 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-indigo-500 focus:ring-indigo-500";

export const STATUS_FILTER_OPTIONS = [
  { value: StockBatchStatus.ACTIVE, label: "Ativos" },
  { value: StockBatchStatus.CLOSED, label: "Encerrados" },
  { value: "all", label: "Todos" },
];

type SectionKey = "product" | "status" | "expiry";

interface StockFiltersProps {
  filters: IStockFilters;
  onFilterChange: (field: keyof IStockFilters, value: string) => void;
  onApply: () => void;
  onClearFilters: () => void;
  products: Product[];
  hasActiveFilters: boolean;
}

export default function StockFilters({
  filters,
  onFilterChange,
  onApply,
  onClearFilters,
  products,
}: StockFiltersProps) {
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);
  const toggle = (key: SectionKey) => setOpenSection((prev) => (prev === key ? null : key));

  const productBadge = products.find((p) => p.id === filters.productId)?.name ?? null;
  const statusBadge =
    filters.status && filters.status !== StockBatchStatus.ACTIVE
      ? STATUS_FILTER_OPTIONS.find((o) => o.value === filters.status)?.label ?? null
      : null;
  const expiryBadge = filters.expiryBefore || null;

  return (
    <div>
      <FilterAccordionSection
        title="Produto"
        isOpen={openSection === "product"}
        onToggle={() => toggle("product")}
        badge={productBadge}
      >
        <select
          value={filters.productId}
          onChange={(e) => onFilterChange("productId", e.target.value)}
          className={inputBaseClasses}
        >
          <option value="">Todos</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </FilterAccordionSection>

      <FilterAccordionSection
        title="Status"
        isOpen={openSection === "status"}
        onToggle={() => toggle("status")}
        badge={statusBadge}
      >
        <select
          value={filters.status || StockBatchStatus.ACTIVE}
          onChange={(e) => onFilterChange("status", e.target.value)}
          className={inputBaseClasses}
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FilterAccordionSection>

      <FilterAccordionSection
        title="Validade até"
        isOpen={openSection === "expiry"}
        onToggle={() => toggle("expiry")}
        badge={expiryBadge}
      >
        <input
          type="date"
          value={filters.expiryBefore}
          onChange={(e) => onFilterChange("expiryBefore", e.target.value)}
          className={inputBaseClasses}
        />
      </FilterAccordionSection>

      <div className="flex gap-3 pt-4">
        <Button type="button" onClick={onClearFilters} variant="secondary" fullWidth>
          Limpar
        </Button>
        <Button type="button" onClick={onApply} fullWidth>
          Aplicar
        </Button>
      </div>
    </div>
  );
}
