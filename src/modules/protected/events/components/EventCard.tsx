import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import ActionMenu from "../../../../shared/components/ActionMenu";
import { formatDateBR } from "../../../../shared/utils/formatDate";
import { EVENT_TYPE_LABELS, IEvent } from "../types";

interface EventCardProps {
  events: IEvent[];
  onEdit: (event: IEvent) => void;
  onDelete: (event: IEvent) => void;
}

export default function EventCard({ events, onEdit, onDelete }: EventCardProps) {
  if (events.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-gray-400 text-sm">
        Nenhum evento encontrado.
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
      {events.map((event) => (
        <div
          key={event.id}
          className="px-4 py-4 flex items-start justify-between gap-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {event.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {formatDateBR(event.date)}
              {" · "}
              {EVENT_TYPE_LABELS[event.type] ?? event.type}
            </p>
            <p className="mt-1.5 text-sm font-semibold text-green-500">
              {(event.totalRevenue || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <ActionMenu
            items={[
              {
                key: "edit",
                label: "Editar",
                icon: <Pencil className="h-4 w-4" />,
                onClick: () => onEdit(event),
              },
              {
                key: "delete",
                label: "Excluir",
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => onDelete(event),
                danger: true,
              },
            ]}
          />
        </div>
      ))}
    </div>
  );
}
