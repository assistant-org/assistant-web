import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { IProductsPresentationProps } from "./types";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import PageHeader from "../../../shared/components/PageHeader";
import ActionMenu from "../../../shared/components/ActionMenu";
import Switch from "../../../shared/components/Switch";
import DeleteModal from "../../../shared/components/DeleteModal";
import ProductForm from "./components/ProductForm";
import ProductCard from "./components/ProductCard";
import FormShell from "../../../shared/components/FormShell";
import PaginationControls from "../../../shared/components/PaginationControls";
import ListSkeleton from "../../../shared/components/ListSkeleton";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";

export default function ProductsPresentation({
  products,
  onOpenModal,
  isModalOpen,
  onCloseModal,
  editingProduct,
  formMethods,
  onSave,
  isLoading,
  isListLoading,
  onToggleActive,
  onDelete,
  isDeleteModalOpen,
  onCloseDeleteModal,
  onConfirmDelete,
  isDeleting,
  productToDelete,
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: IProductsPresentationProps) {
  const isMobile = useMediaQuery("(max-width: 700px)");

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle="Cadastro de chopps e preços por litro"
        actions={<Button onClick={() => onOpenModal()}>+ Novo Produto</Button>}
      />

      <Card className={isMobile ? "!p-0 overflow-hidden" : ""}>
        {isListLoading ? (
          <ListSkeleton
            variant={isMobile ? "cards" : "table"}
            rows={5}
            columns={4}
          />
        ) : isMobile ? (
          <ProductCard
            products={products}
            onEdit={onOpenModal}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
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
                    Preço/L
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Nenhum produto cadastrado.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </td>
                    <td className="px-6 py-4">
                      {(product.defaultUnitValue ?? 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                      /L
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          product.active
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {product.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <ActionMenu
                            items={[
                              {
                                key: "edit",
                                label: "Editar",
                                icon: <Pencil className="h-4 w-4" />,
                                onClick: () => onOpenModal(product),
                              },
                              {
                                key: "delete",
                                label: "Excluir",
                                icon: <Trash2 className="h-4 w-4" />,
                                onClick: () => onDelete(product),
                                danger: true,
                              },
                            ]}
                          />
                          <Switch
                            checked={product.active}
                            onChange={() => onToggleActive(product)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
        title={editingProduct ? "Editar Produto" : "Novo Produto"}
        requireConfirmClose
      >
        {({ requestClose }) => (
          <ProductForm
            formMethods={formMethods}
            onSave={onSave}
            onCancel={requestClose}
            isLoading={isLoading}
          />
        )}
      </FormShell>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
        title="Remover Produto"
        message={
          productToDelete
            ? `Tem certeza que deseja remover "${productToDelete.name}"? Lotes e movimentações de estoque vinculados também serão apagados`
            : "Tem certeza que deseja remover este produto"
        }
        isDeleting={isDeleting}
      />
    </div>
  );
}
