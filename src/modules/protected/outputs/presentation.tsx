import React from "react";
import { IOutputsPresentationProps, OutputType, PaymentMethod } from "./types";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import DeleteModal from "../../../shared/components/DeleteModal";
import OutputForm from "./components/OutputForm";
import TableActions from "../../../shared/components/TableActions";

const inputBaseClasses =
  "block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-indigo-500 focus:ring-indigo-500";
const labelBaseClasses =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Saídas
        </h1>
        <Button onClick={() => onOpenModal()}>+ Nova Saída</Button>
      </div>

      <Card className="mb-6">
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
          <div className="lg:col-span-3">
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
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2"></div>
          <div className="lg:col-span-3">
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
              <option value={PaymentMethod.MONEY}>Dinheiro</option>
              <option value={PaymentMethod.PIX}>Pix</option>
              <option value={PaymentMethod.CREDIT_CARD}>
                Cartão de Crédito
              </option>
              <option value={PaymentMethod.DEBIT_CARD}>Cartão de Débito</option>
            </select>
          </div>
          <div className="lg:col-span-1">
            <Button onClick={onClearFilters} variant="secondary" fullWidth>
              Limpar
            </Button>
          </div>
        </div>
      </Card>

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
    </div>
  );
}
