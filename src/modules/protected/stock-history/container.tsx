import React, { useCallback, useEffect, useState } from "react";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import PageHeader from "../../../shared/components/PageHeader";
import BottomSheet from "../../../shared/components/BottomSheet";
import FilterButton from "../../../shared/components/FilterButton";
import FilterPopover from "../../../shared/components/filters/FilterPopover";
import FilterBadges, { FilterBadgeChip } from "../../../shared/components/filters/FilterBadges";
import PaginationControls from "../../../shared/components/PaginationControls";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { useToast } from "../../../shared/context/ToastContext";
import { productsService } from "../../../shared/services/products/products.service";
import { Product } from "../../../shared/services/products/types";
import { eventsService } from "../../../shared/services/events/events.service";
import { stockMovementsService } from "../../../shared/services/stock/stockMovements.service";
import {
  StockMovement,
  StockMovementType,
} from "../../../shared/services/stock/types";
import { formatDateBR } from "../../../shared/utils/formatDate";
import { usePagination } from "../../../shared/hooks/usePagination";
import HistoryFilters, {
  EMPTY_HISTORY_FILTERS,
  HISTORY_TYPE_OPTIONS,
  IHistoryFilters,
} from "./components/HistoryFilters";

const TYPE_LABELS: Record<string, string> = {
  [StockMovementType.ENTRY]: "Entrada",
  [StockMovementType.EXIT]: "Saída",
  [StockMovementType.LOSS]: "Perda",
  [StockMovementType.INTERNAL_CONSUMPTION]: "Consumo Interno",
  [StockMovementType.ADJUSTMENT]: "Ajuste",
};

export default function StockHistoryContainer() {
  const { success, error: toastError } = useToast();
  const isMobile = useMediaQuery("(max-width: 700px)");
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [reversingId, setReversingId] = useState<string | null>(null);

  const [filters, setFilters] = useState<IHistoryFilters>(EMPTY_HISTORY_FILTERS);
  const [tempFilters, setTempFilters] = useState<IHistoryFilters>(EMPTY_HISTORY_FILTERS);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

  const pagination = usePagination(movements, 10);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await stockMovementsService.findAll({
      productId: filters.productId || undefined,
      type: (filters.type as StockMovementType) || undefined,
      eventId: filters.eventId || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    });
    if (result.error) toastError(result.error);
    else setMovements(result.data || []);
    setLoading(false);
  }, [filters, toastError]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void productsService.findAll({ includeInactive: true }).then((r) => {
      if (r.data) setProducts(r.data);
    });
    void eventsService.findAll().then((r) => {
      if (Array.isArray(r.data)) {
        setEvents(
          r.data
            .filter((e: { id?: string }) => e.id)
            .map((e: { id?: string; name: string }) => ({
              id: String(e.id),
              name: e.name,
            })),
        );
      }
    });
  }, []);

  const eventName = (id?: string | null) =>
    events.find((e) => e.id === id)?.name || id || "-";
  const productName = (id: string) =>
    products.find((p) => p.id === id)?.name || id;

  const pageItems = pagination.paginatedItems;

  const hasActiveFilters = Boolean(
    filters.productId ||
      filters.type ||
      filters.eventId ||
      filters.dateFrom ||
      filters.dateTo,
  );

  const handleTempFilterChange = (key: keyof IHistoryFilters, value: string) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setIsFilterSheetOpen(false);
    setIsFilterPopoverOpen(false);
  };

  const handleClearFilters = () => {
    setTempFilters(EMPTY_HISTORY_FILTERS);
    setFilters(EMPTY_HISTORY_FILTERS);
    setIsFilterSheetOpen(false);
    setIsFilterPopoverOpen(false);
  };

  const filterChips: FilterBadgeChip[] = [];
  if (filters.productId) {
    filterChips.push({
      key: "product",
      label: `Produto: ${productName(filters.productId)}`,
      onRemove: () => setFilters((prev) => ({ ...prev, productId: "" })),
    });
  }
  if (filters.type) {
    filterChips.push({
      key: "type",
      label: `Tipo: ${HISTORY_TYPE_OPTIONS.find((o) => o.value === filters.type)?.label || filters.type}`,
      onRemove: () => setFilters((prev) => ({ ...prev, type: "" })),
    });
  }
  if (filters.eventId) {
    filterChips.push({
      key: "event",
      label: `Evento: ${eventName(filters.eventId)}`,
      onRemove: () => setFilters((prev) => ({ ...prev, eventId: "" })),
    });
  }
  if (filters.dateFrom || filters.dateTo) {
    filterChips.push({
      key: "period",
      label: `Período: ${filters.dateFrom ? formatDateBR(filters.dateFrom) : "…"} – ${filters.dateTo ? formatDateBR(filters.dateTo) : "…"}`,
      onRemove: () =>
        setFilters((prev) => ({ ...prev, dateFrom: "", dateTo: "" })),
    });
  }

  const handleReverse = async (m: StockMovement) => {
    if (m.reversesMovementId) {
      toastError("Não é possível reverter uma reversão");
      return;
    }
    setReversingId(m.id);
    const result = await stockMovementsService.reverse(m.id);
    setReversingId(null);
    if (result.error) toastError(result.error);
    else {
      success("Movimentação revertida com sucesso!");
      void load();
    }
  };

  const filtersPanel = (
    <HistoryFilters
      filters={tempFilters}
      onFilterChange={handleTempFilterChange}
      onApply={handleApplyFilters}
      onClearFilters={handleClearFilters}
      products={products}
      events={events}
      hasActiveFilters={hasActiveFilters}
    />
  );

  return (
    <div>
      <PageHeader
        title="Histórico de Movimentações"
        subtitle="Entradas e saídas registradas"
        filters={
          isMobile ? (
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
              {filtersPanel}
            </FilterPopover>
          )
        }
      />

      {filterChips.length > 0 && (
        <div className="mb-4">
          <FilterBadges chips={filterChips} />
        </div>
      )}

      <Card className={isMobile ? "!p-0 overflow-hidden" : ""}>
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Carregando...</p>
        ) : pageItems.length === 0 ? (
          <p className="p-6 text-sm text-gray-500 text-center">
            Nenhuma movimentação encontrada.
          </p>
        ) : isMobile ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {pageItems.map((m) => (
              <div key={m.id} className="px-4 py-4">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {m.productName || productName(m.productId)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {TYPE_LABELS[m.type] || m.type} · {formatDateBR(m.date)} ·{" "}
                      {m.quantity.toLocaleString("pt-BR", {
                        maximumFractionDigits: 2,
                      })}{" "}
                      L
                    </p>
                    <p className="text-xs text-gray-500">
                      Evento: {eventName(m.eventId)}
                    </p>
                    {m.reason && (
                      <p className="text-xs text-gray-400 mt-1">{m.reason}</p>
                    )}
                  </div>
                  {!m.reversesMovementId && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleReverse(m)}
                      isLoading={reversingId === m.id}
                    >
                      Reverter
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 text-gray-500">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3 text-right">Qtd.</th>
                  <th className="px-4 py-3">Evento</th>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3">Usuário</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-3">{formatDateBR(m.date)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {m.productName || productName(m.productId)}
                    </td>
                    <td className="px-4 py-3">{TYPE_LABELS[m.type] || m.type}</td>
                    <td className="px-4 py-3 text-right">
                      {m.quantity.toLocaleString("pt-BR", {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3">{eventName(m.eventId)}</td>
                    <td className="px-4 py-3">{m.reason || "-"}</td>
                    <td className="px-4 py-3 text-xs">
                      {m.userId ? m.userId.slice(0, 8) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!m.reversesMovementId && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleReverse(m)}
                          isLoading={reversingId === m.id}
                        >
                          Reverter
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <PaginationControls
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalItems={pagination.totalItems}
        totalPages={pagination.totalPages}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />

      <BottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="Filtros"
      >
        {filtersPanel}
      </BottomSheet>
    </div>
  );
}
