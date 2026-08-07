import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import ActionMenu from "../../../../shared/components/ActionMenu";
import Switch from "../../../../shared/components/Switch";
import { CATEGORY_TYPE_LABELS, ICategory } from "../types";

interface CategoryCardProps {
  categories: ICategory[];
  onEdit: (category: ICategory) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (category: ICategory) => void;
}

const StatusBadge: React.FC<{ status: boolean }> = ({ status }) => (
  <span
    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
      status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    }`}
  >
    {status ? "Ativa" : "Inativa"}
  </span>
);

export default function CategoryCard({
  categories,
  onEdit,
  onToggleStatus,
  onDelete,
}: CategoryCardProps) {
  if (categories.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-gray-400 text-sm">
        Nenhuma categoria encontrada.
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
      {categories.map((category) => (
        <div
          key={category.id}
          className="px-4 py-4 flex items-start justify-between gap-3"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {category.color && (
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: category.color }}
                />
              )}
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {category.name}
              </p>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {CATEGORY_TYPE_LABELS[category.type] ?? category.type}
              </span>
              <StatusBadge status={category.status} />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ActionMenu
              items={[
                {
                  key: "edit",
                  label: "Editar",
                  icon: <Pencil className="h-4 w-4" />,
                  onClick: () => onEdit(category),
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
        </div>
      ))}
    </div>
  );
}
