import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import Switch from "../../../../shared/components/Switch";
import { Product } from "../../../../shared/services/products/types";

interface ProductCardProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleActive: (product: Product) => void;
}

export default function ProductCard({
  products,
  onEdit,
  onDelete,
  onToggleActive,
}: ProductCardProps) {
  if (products.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-gray-400 text-sm">
        Nenhum produto cadastrado.
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
      {products.map((product) => (
        <div key={product.id} className="px-4 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {product.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {(product.defaultUnitValue ?? 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              /L
            </p>
            <span
              className={`mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                product.active
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {product.active ? "Ativo" : "Inativo"}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="text-indigo-600 hover:text-indigo-800 dark:text-zinc-400 dark:hover:text-white p-1 -m-1"
              aria-label="Editar"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(product)}
              className="text-red-600 hover:text-red-800 dark:text-zinc-400 dark:hover:text-white p-1 -m-1"
              aria-label="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <Switch
              checked={product.active}
              onChange={() => onToggleActive(product)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
