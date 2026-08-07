import React, { useState } from "react";
import Button from "../../../../shared/components/Button";
import FilterAccordionSection from "../../../../shared/components/filters/FilterAccordionSection";
import { Product } from "../../../../shared/services/products/types";
import { StockMovementType } from "../../../../shared/services/stock/types";
import { formatDateBR } from "../../../../shared/utils/formatDate";

export interface IHistoryFilters {
  productId: string;
  type: string;
  eventId: string;
  dateFrom: string;
  dateTo: string;
}

export const HISTORY_TYPE_OPTIONS = [
  { value: "", label: "Todos" },
  { value: StockMovementType.ENTRY, label: "Entrada" },
  { value: StockMovementType.EXIT, label: "Saída" },
  { value: StockMovementType.LOSS, label: "Perda" },
  { value: StockMovementType.INTERNAL_CONSUMPTION, label: "Consumo Interno" },
  { value: StockMovementType.ADJUSTMENT, label: "Ajuste" },
];

const inputBaseClasses =
  "block w-full min-h-11 rounded-md border px-3 py-2 text-base shadow-sm focus:outline-none sm:min-h-0 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-indigo-500 focus:ring-indigo-500";

type SectionKey = "product" | "type" | "event" | "period";

interface HistoryFiltersProps {
  filters: IHistoryFilters;
  onFilterChange: (field: keyof IHistoryFilters, value: string) => void;
  onApply: () => void;
  onClearFilters: () => void;
  products: Product[];
  events: { id: string; name: string }[];
  hasActiveFilters: boolean;
}

export default function HistoryFilters({
  filters,
  onFilterChange,
  onApply,
  onClearFilters,
  products,
  events,
}: HistoryFiltersProps) {
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);
  const toggle = (key: SectionKey) =>
    setOpenSection((prev) => (prev === key ? null : key));

  const productBadge =
    products.find((p) => p.id === filters.productId)?.name ?? null;
  const typeBadge =
    filters.type
      ? HISTORY_TYPE_OPTIONS.find((o) => o.value === filters.type)?.label ?? null
      : null;
  const eventBadge = events.find((e) => e.id === filters.eventId)?.name ?? null;
  const periodBadge =
    filters.dateFrom || filters.dateTo
      ? [
          filters.dateFrom ? formatDateBR(filters.dateFrom) : "…",
          filters.dateTo ? formatDateBR(filters.dateTo) : "…",
        ].join(" – ")
      : null;

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
        title="Tipo"
        isOpen={openSection === "type"}
        onToggle={() => toggle("type")}
        badge={typeBadge}
      >
        <select
          value={filters.type}
          onChange={(e) => onFilterChange("type", e.target.value)}
          className={inputBaseClasses}
        >
          {HISTORY_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FilterAccordionSection>

      <FilterAccordionSection
        title="Evento"
        isOpen={openSection === "event"}
        onToggle={() => toggle("event")}
        badge={eventBadge}
      >
        <select
          value={filters.eventId}
          onChange={(e) => onFilterChange("eventId", e.target.value)}
          className={inputBaseClasses}
        >
          <option value="">Todos</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </FilterAccordionSection>

      <FilterAccordionSection
        title="Período"
        isOpen={openSection === "period"}
        onToggle={() => toggle("period")}
        badge={periodBadge}
      >
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange("dateFrom", e.target.value)}
            className={`${inputBaseClasses} flex-1`}
          />
          <span className="text-gray-500 text-sm">até</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFilterChange("dateTo", e.target.value)}
            className={`${inputBaseClasses} flex-1`}
          />
        </div>
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

export const EMPTY_HISTORY_FILTERS: IHistoryFilters = {
  productId: "",
  type: "",
  eventId: "",
  dateFrom: "",
  dateTo: "",
};
