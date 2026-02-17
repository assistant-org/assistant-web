import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface TableActionsProps {
  onEdit?: () => void;
  onViewDetails?: () => void;
  onDelete?: () => void;
}

const TableActions: React.FC<TableActionsProps> = ({
  onEdit,
  onViewDetails,
  onDelete,
}) => {
  return (
    <div className="flex items-center space-x-2">
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="text-blue-600 hover:text-blue-800 dark:text-white dark:hover:text-blue-400"
          title="Detalhes"
        >
          <Eye className="w-5 h-5" />
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          className="text-indigo-600 hover:text-indigo-800 dark:text-white dark:hover:text-indigo-400"
          title="Editar"
        >
          <Pencil className="w-5 h-5" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 dark:text-indigo-700 dark:hover:text-red-400"
          title="Excluir"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default TableActions;
