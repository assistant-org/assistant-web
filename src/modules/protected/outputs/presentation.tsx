import React, { useState } from "react";
import { IOutputsPresentationProps } from "./types";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import DeleteModal from "../../../shared/components/DeleteModal";
import OutputForm from "./components/OutputForm";
import TableActions from "../../../shared/components/TableActions";
import BottomSheet from "../../../shared/components/BottomSheet";
import FilterButton from "../../../shared/components/FilterButton";
import OutputsFilterPanel from "./components/OutputsFilterPanel";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";

export default function OutputsPresentation({
  outputs,
  filters,
  onFilterChange,
  onClearFilters,
  onOpenModal,
  onDeleteOutput,
  onViewDetails,
  isModalOpen,
  onCloseModal,
  editingOutput,
  viewingOutput,
  formMethods,
  onSave,
  isLoading,
  categories,
  events,
  isDeleteModalOpen,
  onCloseDeleteModal,
  onConfirmDelete,
  isDeleting,
}: IOutputsPresentationProps) {
  const totalOutputs = outputs.reduce((acc, output) => acc + output.value, 0);
  const isMobile = useMediaQuery("(max-width: 700px)");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  const hasActiveFilters =
    filters.startDate ||
    filters.endDate ||
    filters.category ||
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
          Saídas
        </h1>
        <div className="flex gap-2">
          <Button onClick={() => onOpenModal()}>+ Nova Saída</Button>
        </div>
      </div>

      {!isMobile && (
        <Card className="mb-6">
          <OutputsFilterPanel
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            isMobile={false}
            hasActiveFilters={hasActiveFilters}
            categories={categories}
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
                  Pgto
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Valor
                </th>
                <th scope="col" className="px-6 py-3">
                  {" "}
                </th>
              </tr>
            </thead>
            <tbody>
              {outputs.map((output) => (
                <tr
                  key={output.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    {new Date(output.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{output.category}</td>
                  <td className="px-6 py-4 capitalize">
                    {output.paymentMethod}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-white">
                    {output.value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <TableActions
                      onViewDetails={() => onViewDetails(output)}
                      onEdit={() => onOpenModal(output)}
                      onDelete={() => onDeleteOutput(output.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700">
                <td colSpan={4} className="px-6 py-3 text-base text-right">
                  Total
                </td>
                <td className="px-6 py-3 text-base text-right">
                  {totalOutputs.toLocaleString("pt-BR", {
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
        title={editingOutput ? "Editar Saída" : "Nova Saída"}
      >
        <OutputForm
          formMethods={formMethods}
          onSave={onSave}
          onCancel={onCloseModal}
          isLoading={isLoading}
          categories={categories}
          events={events}
        />
      </Modal>

      {viewingOutput && (
        <Modal
          isOpen={!!viewingOutput}
          onClose={onCloseModal}
          title="Detalhes da Saída"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {new Date(viewingOutput.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Categoria
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {viewingOutput.category}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                {viewingOutput.type}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Forma de Pagamento
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                {viewingOutput.paymentMethod}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Valor
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white font-medium text-red-500">
                {viewingOutput.value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
            {viewingOutput.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descrição
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {viewingOutput.description}
                </p>
              </div>
            )}
            {viewingOutput.event && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Evento
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {events.find((e) => e.id === viewingOutput.event)?.name ||
                    viewingOutput.event}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
        title="Excluir Saída"
        message="Tem certeza que deseja excluir esta saída"
        isDeleting={isDeleting}
      />

      <BottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="Filtros"
      >
        <OutputsFilterPanel
          filters={tempFilters}
          onFilterChange={handleTempFilterChange}
          onClearFilters={
            hasActiveFilters ? handleClearFilters : handleApplyFilters
          }
          isMobile={true}
          hasActiveFilters={hasActiveFilters}
          categories={categories}
        />
      </BottomSheet>
    </div>
  );
}
