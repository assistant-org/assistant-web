import React from "react";
import { EVENT_TYPE_LABELS, IEventsPresentationProps } from "./types";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import FormShell from "../../../shared/components/FormShell";
import EventForm from "./components/EventForm";
import EventCard from "./components/EventCard";
import TableActions from "../../../shared/components/TableActions";
import PaginationControls from "../../../shared/components/PaginationControls";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { formatDateBR } from "../../../shared/utils/formatDate";

export default function EventsPresentation({
  events,
  onOpenModal,
  isModalOpen,
  onCloseModal,
  editingEvent,
  formMethods,
  onSave,
  isLoading,
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: IEventsPresentationProps) {
  const isMobile = useMediaQuery("(max-width: 700px)");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Eventos</h1>
        <Button onClick={() => onOpenModal()}>+ Novo Evento</Button>
      </div>

      <Card className={isMobile ? "!p-0 overflow-hidden" : ""}>
        {isMobile ? (
          <EventCard events={events} onEdit={onOpenModal} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    Faturamento Total
                  </th>
                  <th scope="col" className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {event.name}
                    </td>
                    <td className="px-6 py-4">
                      {formatDateBR(event.date)}
                    </td>
                    <td className="px-6 py-4">
                      {EVENT_TYPE_LABELS[event.type] ?? event.type}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-green-500">
                      {(event.totalRevenue || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <TableActions onEdit={() => onOpenModal(event)} />
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
        title={editingEvent ? "Editar Evento" : "Novo Evento"}
        requireConfirmClose
      >
        {({ requestClose }) => (
          <EventForm
            formMethods={formMethods}
            onSave={onSave}
            onCancel={requestClose}
            isLoading={isLoading}
          />
        )}
      </FormShell>
    </div>
  );
}
