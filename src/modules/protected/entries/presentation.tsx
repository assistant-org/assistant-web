import React, { useState } from "react";
import { IEntriesPresentationProps } from "./types";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import DeleteModal from "../../../shared/components/DeleteModal";
import EntryForm from "./components/EntryForm";
import TableActions from "../../../shared/components/TableActions";
import BottomSheet from "../../../shared/components/BottomSheet";
import FilterButton from "../../../shared/components/FilterButton";
import EntriesFilterPanel from "./components/EntriesFilterPanel";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";

export default function EntriesPresentation({
  entries,
  filters,
  onFilterChange,
  onClearFilters,
  onOpenModal,
  onDeleteEntry,
  isModalOpen,
  onCloseModal,
  editingEntry,
  formMethods,
  onSave,
  isLoading,
  availableStockItems,
  categories,
  events,
  getEventName,
  isDeleteModalOpen,
  onCloseDeleteModal,
  onConfirmDelete,
  isDeleting,
}: IEntriesPresentationProps) {
  const totalEntries = entries.reduce((acc, entry) => acc + entry.value, 0);
  const isMobile = useMediaQuery("(max-width: 700px)");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  const hasActiveFilters =
    filters.startDate ||
    filters.endDate ||
    filters.category ||
    filters.event ||
    filters.eventType ||
    filters.paymentMethod;

  const handleTempFilterChange = (key: keyof typeof filters, value: string) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    Object.entries(tempFilters).forEach(([key, value]) => {
      onFilterChange(key as keyof typeof filters, value as string);
    });
    setIsFilterSheetOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      startDate: "",
      endDate: "",
      category: "",
      event: "",
      eventType: "",
      paymentMethod: "",
    };
    setTempFilters(clearedFilters);
    onClearFilters();
    setIsFilterSheetOpen(false);
  };

  const openFilterSheet = () => {
    setTempFilters(filters);
    setIsFilterSheetOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Entradas
        </h1>
        <div className="flex gap-2">
          <Button onClick={() => onOpenModal()}>+ Nova Entrada</Button>
        </div>
      </div>

      {!isMobile && (
        <Card className="mb-6">
          <EntriesFilterPanel
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            isMobile={false}
            hasActiveFilters={hasActiveFilters}
          />
        </Card>
      )}

      <div className="py-3">
        {isMobile && (
          <FilterButton
            onClick={openFilterSheet}
            hasActiveFilters={hasActiveFilters}
          />
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Data
                </th>
                <th scope="col" className="px-6 py-3">
                  Categoria
                </th>
                <th scope="col" className="px-6 py-3">
                  Evento
                </th>
                <th scope="col" className="px-6 py-3">
                  Pgto
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Valor
                </th>
                <th scope="col" className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{entry.category}</td>
                  <td className="px-6 py-4">
                    {getEventName(entry.event) || "-"}
                  </td>
                  <td className="px-6 py-4 capitalize">
                    {entry.paymentMethod || "-"}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-green-500">
                    {entry.value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <TableActions
                      onEdit={() => onOpenModal(entry)}
                      onDelete={() => onDeleteEntry(entry.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700">
                <td colSpan={5} className="px-6 py-3 text-base text-right">
                  Total
                </td>
                <td className="px-6 py-3 text-base text-right">
                  {totalEntries.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        title={editingEntry ? "Editar Entrada" : "Nova Entrada"}
      >
        <EntryForm
          formMethods={formMethods}
          onSave={onSave}
          onCancel={onCloseModal}
          isLoading={isLoading}
          availableStockItems={availableStockItems}
          categories={categories}
          events={events}
        />
      </Modal>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
        title="Excluir Entrada"
        message="Tem certeza que deseja excluir esta entrada"
        isDeleting={isDeleting}
      />

      <BottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="Filtros"
      >
        <EntriesFilterPanel
          filters={tempFilters}
          onFilterChange={handleTempFilterChange}
          onClearFilters={
            hasActiveFilters ? handleClearFilters : handleApplyFilters
          }
          isMobile={true}
          hasActiveFilters={hasActiveFilters}
        />
      </BottomSheet>
    </div>
  );
}
