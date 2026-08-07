import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { CATEGORY_TYPE_LABELS, ICategoriesPresentationProps } from "./types";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import PageHeader from "../../../shared/components/PageHeader";
import FormShell from "../../../shared/components/FormShell";
import DeleteModal from "../../../shared/components/DeleteModal";
import ActionMenu from "../../../shared/components/ActionMenu";
import CategoryForm from "./components/CategoryForm";
import CategoryCard from "./components/CategoryCard";
import Switch from "../../../shared/components/Switch";
import PaginationControls from "../../../shared/components/PaginationControls";
import ListSkeleton from "../../../shared/components/ListSkeleton";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";

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
  onDelete,
  isModalOpen,
  onCloseModal,
  editingCategory,
  formMethods,
  onSave,
  isLoading,
  isListLoading,
  isDeleteModalOpen,
  categoryToDelete,
  onCloseDelete,
  onConfirmDelete,
  isDeleting,
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: ICategoriesPresentationProps) {
  const isMobile = useMediaQuery("(max-width: 700px)");

  return (
    <div>
      <PageHeader
        title="Categorias"
        subtitle="Organize as categorias financeiras"
        actions={
          <Button onClick={() => onOpenModal()}>+ Nova Categoria</Button>
        }
      />

      <Card className={isMobile ? "!p-0 overflow-hidden" : ""}>
        {isListLoading ? (
          <ListSkeleton
            variant={isMobile ? "cards" : "table"}
            rows={5}
            columns={4}
          />
        ) : isMobile ? (
          <CategoryCard
            categories={categories}
            onEdit={onOpenModal}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
          />
        ) : (
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
                    <td className="px-6 py-4">
                      {CATEGORY_TYPE_LABELS[category.type] ?? category.type}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={category.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <ActionMenu
                          items={[
                            {
                              key: "edit",
                              label: "Editar",
                              icon: <Pencil className="h-4 w-4" />,
                              onClick: () => onOpenModal(category),
                            },
                            {
                              key: "delete",
                              label: "Excluir",
                              icon: <Trash2 className="h-4 w-4" />,
                              onClick: () => onDelete(category),
                              danger: true,
                            },
                          ]}
                        />
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

      <FormShell
        isOpen={isModalOpen}
        onClose={onCloseModal}
        title={editingCategory ? "Editar Categoria" : "Nova Categoria"}
        requireConfirmClose
      >
        {({ requestClose }) => (
          <CategoryForm
            formMethods={formMethods}
            onSave={onSave}
            onCancel={requestClose}
            isLoading={isLoading}
          />
        )}
      </FormShell>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={onCloseDelete}
        onConfirm={onConfirmDelete}
        title="Excluir categoria"
        message="Tem certeza que deseja excluir a categoria"
        itemName={categoryToDelete?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}
