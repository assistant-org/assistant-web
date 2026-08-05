import React, { useState } from "react";
import Button from "../../../../shared/components/Button";
import FilterAccordionSection from "../../../../shared/components/filters/FilterAccordionSection";
import {
  TransactionOrigin,
  TransactionStatus,
  TransactionType,
} from "../../../../shared/services/transactions/types";
import { ITransactionFiltersProps, IFinancialFilters } from "../types";

const inputBaseClasses =
  "block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-indigo-500 focus:ring-indigo-500";

export const TYPE_OPTIONS = [
  { value: TransactionType.INCOME, label: "Receita" },
  { value: TransactionType.EXPENSE, label: "Despesa" },
];

export const ORIGIN_OPTIONS = [
  { value: TransactionOrigin.MANUAL, label: "Manual" },
  { value: TransactionOrigin.EVENT, label: "Evento" },
  { value: TransactionOrigin.BUDGET, label: "Orçamento" },
  { value: TransactionOrigin.ADJUSTMENT, label: "Ajuste" },
];

export const STATUS_OPTIONS = [
  { value: TransactionStatus.ACTIVE, label: "Ativas" },
  { value: TransactionStatus.CANCELLED, label: "Canceladas" },
  { value: "all", label: "Todas" },
];

type SectionKey = "period" | "type" | "category" | "account" | "origin" | "event" | "status";

const TransactionFilters: React.FC<ITransactionFiltersProps> = ({
  filters,
  onFilterChange,
  onApply,
  onClearFilters,
  hasActiveFilters,
  categories,
  accounts,
  events,
  eventsEnabled,
}) => {
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);

  const toggle = (key: SectionKey) => setOpenSection((prev) => (prev === key ? null : key));

  const handleChange = (field: keyof IFinancialFilters) =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
      onFilterChange(field, e.target.value);

  const periodBadge = filters.startDate || filters.endDate ? "Definido" : null;
  const typeBadge = TYPE_OPTIONS.find((o) => o.value === filters.type)?.label ?? null;
  const categoryBadge = categories.find((c) => c.id === filters.categoryId)?.name ?? null;
  const accountBadge = accounts.find((a) => a.id === filters.accountId)?.name ?? null;
  const originBadge = ORIGIN_OPTIONS.find((o) => o.value === filters.origin)?.label ?? null;
  const eventBadge = events.find((e) => e.id === filters.eventId)?.name ?? null;
  const statusBadge =
    filters.status && filters.status !== TransactionStatus.ACTIVE
      ? STATUS_OPTIONS.find((o) => o.value === filters.status)?.label ?? null
      : null;

  return (
    <div>
      <div>
        <FilterAccordionSection
          title="Período"
          isOpen={openSection === "period"}
          onToggle={() => toggle("period")}
          badge={periodBadge}
        >
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={handleChange("startDate")}
              className={`${inputBaseClasses} flex-1`}
            />
            <span className="text-gray-500 text-sm">até</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={handleChange("endDate")}
              className={`${inputBaseClasses} flex-1`}
            />
          </div>
        </FilterAccordionSection>

        <FilterAccordionSection
          title="Tipo"
          isOpen={openSection === "type"}
          onToggle={() => toggle("type")}
          badge={typeBadge}
        >
          <select
            value={filters.type}
            onChange={handleChange("type")}
            className={inputBaseClasses}
          >
            <option value="">Todos</option>
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FilterAccordionSection>

        <FilterAccordionSection
          title="Categoria"
          isOpen={openSection === "category"}
          onToggle={() => toggle("category")}
          badge={categoryBadge}
        >
          <select
            value={filters.categoryId}
            onChange={handleChange("categoryId")}
            className={inputBaseClasses}
          >
            <option value="">Todas</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </FilterAccordionSection>

        <FilterAccordionSection
          title="Conta"
          isOpen={openSection === "account"}
          onToggle={() => toggle("account")}
          badge={accountBadge}
        >
          <select
            value={filters.accountId}
            onChange={handleChange("accountId")}
            className={inputBaseClasses}
          >
            <option value="">Todas</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </FilterAccordionSection>

        <FilterAccordionSection
          title="Origem"
          isOpen={openSection === "origin"}
          onToggle={() => toggle("origin")}
          badge={originBadge}
        >
          <select
            value={filters.origin}
            onChange={handleChange("origin")}
            className={inputBaseClasses}
          >
            <option value="">Todas</option>
            {ORIGIN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FilterAccordionSection>

        {eventsEnabled && (
          <FilterAccordionSection
            title="Evento"
            isOpen={openSection === "event"}
            onToggle={() => toggle("event")}
            badge={eventBadge}
          >
            <select
              value={filters.eventId}
              onChange={handleChange("eventId")}
              className={inputBaseClasses}
            >
              <option value="">Todos</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </FilterAccordionSection>
        )}

        <FilterAccordionSection
          title="Status"
          isOpen={openSection === "status"}
          onToggle={() => toggle("status")}
          badge={statusBadge}
        >
          <select
            value={filters.status}
            onChange={handleChange("status")}
            className={inputBaseClasses}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FilterAccordionSection>
      </div>

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
};

export default TransactionFilters;
