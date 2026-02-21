import React from "react";
import { ICategoriesPresentationProps } from "./types";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import CategoryForm from "./components/CategoryForm";
import Switch from "../../../shared/components/Switch";
import TableActions from "../../../shared/components/TableActions";

const StatusBadge: React.FC<{ status: boolean }> = ({ status }) => {
  const baseClasses =
    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
  const statusClasses = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`${baseClasses} ${status ? statusClasses.active : statusClasses.inactive}`}
    >
      {status ? "Ativa" : "Inativa"}
    </span>
  );
};

export default function CategoriesPresentation({
  categories,
  onOpenModal,
  onToggleStatus,
  isModalOpen,
  onCloseModal,
  editingCategory,
  formMethods,
  onSave,
  isLoading,
}: ICategoriesPresentationProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Categorias
        </h1>
        <Button onClick={() => onOpenModal()}>+ Nova Categoria</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center">
                    {category.color && (
                      <span
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: category.color }}
                      ></span>
                    )}
                    {category.name}
                  </td>
                  <td className="px-6 py-4">{category.type}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={category.status} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-4">
                      <TableActions onEdit={() => onOpenModal(category)} />
                      <Switch
                        checked={category.status}
                        onChange={() => onToggleStatus(category.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        title={editingCategory ? "Editar Categoria" : "Nova Categoria"}
      >
        <CategoryForm
          formMethods={formMethods}
          onSave={onSave}
          onCancel={onCloseModal}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  );
}
