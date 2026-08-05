import React from "react";
import { Pencil } from "lucide-react";
import { formatDateBR } from "../../../../shared/utils/formatDate";
import { EVENT_TYPE_LABELS, IEvent } from "../types";

interface EventCardProps {
  events: IEvent[];
  onEdit: (event: IEvent) => void;
}

export default function EventCard({ events, onEdit }: EventCardProps) {
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
        <div key={event.id} className="px-4 py-4 flex items-start justify-between gap-3">
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
          <button
            type="button"
            onClick={() => onEdit(event)}
            className="text-indigo-600 hover:text-indigo-800 dark:text-zinc-400 dark:hover:text-white p-1 -m-1 shrink-0"
            aria-label="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
