import React from "react";
import Button from "../../../../shared/components/Button";
import { EventType, PaymentMethod } from "../types";

const inputBaseClasses =
  "block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-indigo-500 focus:ring-indigo-500";
const labelBaseClasses =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

interface IFilters {
  startDate: string;
  endDate: string;
  category: string;
  event: string;
  eventType: string;
  paymentMethod: string;
}

interface EntriesFilterPanelProps {
  filters: IFilters;
  onFilterChange: (key: keyof IFilters, value: string) => void;
  onClearFilters: () => void;
  isMobile: boolean;
  hasActiveFilters: boolean;
}

const EntriesFilterPanel: React.FC<EntriesFilterPanelProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  isMobile,
  hasActiveFilters,
}) => {
  if (isMobile) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className={labelBaseClasses}>Período</label>
          <div className="flex flex-col space-y-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange("startDate", e.target.value)}
              className={inputBaseClasses}
            />
            <span className="text-gray-500 text-sm">até</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onFilterChange("endDate", e.target.value)}
              className={inputBaseClasses}
            />
          </div>
        </div>
        <div>
          <label htmlFor="filter-category" className={labelBaseClasses}>
            Categoria
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) => onFilterChange("category", e.target.value)}
            className={inputBaseClasses}
          >
            <option value="">Todas</option>
            <option value="Venda de Chopp">Venda de Chopp</option>
            <option value="Serviço de Bar">Serviço de Bar</option>
            <option value="Aluguel de Equipamento">
              Aluguel de Equipamento
            </option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-event" className={labelBaseClasses}>
            Evento
          </label>
          <input
            type="text"
            id="filter-event"
            placeholder="Buscar evento..."
            value={filters.event}
            onChange={(e) => onFilterChange("event", e.target.value)}
            className={inputBaseClasses}
          />
        </div>
        <div>
          <label htmlFor="filter-eventType" className={labelBaseClasses}>
            Tipo de Evento
          </label>
          <select
            id="filter-eventType"
            value={filters.eventType}
            onChange={(e) => onFilterChange("eventType", e.target.value)}
            className={inputBaseClasses}
          >
            <option value="">Todos</option>
            <option value={EventType.CLOSED}>Fechado</option>
            <option value={EventType.SINGLE}>Avulso</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-paymentMethod" className={labelBaseClasses}>
            Forma de Pgto
          </label>
          <select
            id="filter-paymentMethod"
            value={filters.paymentMethod}
            onChange={(e) => onFilterChange("paymentMethod", e.target.value)}
            className={inputBaseClasses}
          >
            <option value="">Todas</option>
            <option value={PaymentMethod.CASH}>Dinheiro</option>
            <option value={PaymentMethod.PIX}>Pix</option>
            <option value={PaymentMethod.CARD}>Cartão</option>
          </select>
        </div>
        <div className="flex gap-2 pt-4">
          <Button
            onClick={onClearFilters}
            fullWidth
            variant={hasActiveFilters ? "secondary" : "primary"}
          >
            {hasActiveFilters ? "Limpar Filtros" : "Aplicar Filtros"}
          </Button>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
      <div className="lg:col-span-3">
        <label className={labelBaseClasses}>Período</label>
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange("startDate", e.target.value)}
            className={inputBaseClasses}
          />
          <span className="text-gray-500">até</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange("endDate", e.target.value)}
            className={inputBaseClasses}
          />
        </div>
      </div>
      <div className="lg:col-span-2">
        <label htmlFor="filter-category" className={labelBaseClasses}>
          Categoria
        </label>
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) => onFilterChange("category", e.target.value)}
          className={inputBaseClasses}
        >
          <option value="">Todas</option>
          <option value="Venda de Chopp">Venda de Chopp</option>
          <option value="Serviço de Bar">Serviço de Bar</option>
          <option value="Aluguel de Equipamento">Aluguel de Equipamento</option>
        </select>
      </div>
      <div className="lg:col-span-2">
        <label htmlFor="filter-event" className={labelBaseClasses}>
          Evento
        </label>
        <input
          type="text"
          id="filter-event"
          placeholder="Buscar evento..."
          value={filters.event}
          onChange={(e) => onFilterChange("event", e.target.value)}
          className={inputBaseClasses}
        />
      </div>
      <div className="lg:col-span-2">
        <label htmlFor="filter-eventType" className={labelBaseClasses}>
          Tipo de Evento
        </label>
        <select
          id="filter-eventType"
          value={filters.eventType}
          onChange={(e) => onFilterChange("eventType", e.target.value)}
          className={inputBaseClasses}
        >
          <option value="">Todos</option>
          <option value={EventType.CLOSED}>Fechado</option>
          <option value={EventType.SINGLE}>Avulso</option>
        </select>
      </div>
      <div className="lg:col-span-2">
        <label htmlFor="filter-paymentMethod" className={labelBaseClasses}>
          Forma de Pgto
        </label>
        <select
          id="filter-paymentMethod"
          value={filters.paymentMethod}
          onChange={(e) => onFilterChange("paymentMethod", e.target.value)}
          className={inputBaseClasses}
        >
          <option value="">Todas</option>
          <option value={PaymentMethod.CASH}>Dinheiro</option>
          <option value={PaymentMethod.PIX}>Pix</option>
          <option value={PaymentMethod.CARD}>Cartão</option>
        </select>
      </div>
      <div className="lg:col-span-1">
        <Button onClick={onClearFilters} variant="secondary" fullWidth>
          Limpar
        </Button>
      </div>
    </div>
  );
};

export default EntriesFilterPanel;
