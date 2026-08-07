import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { EVENT_TYPE_LABELS, IEventsPresentationProps } from "./types";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import PageHeader from "../../../shared/components/PageHeader";
import FormShell from "../../../shared/components/FormShell";
import DeleteModal from "../../../shared/components/DeleteModal";
import ActionMenu from "../../../shared/components/ActionMenu";
import EventForm from "./components/EventForm";
import EventCard from "./components/EventCard";
import PaginationControls from "../../../shared/components/PaginationControls";
import ListSkeleton from "../../../shared/components/ListSkeleton";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { formatDateBR } from "../../../shared/utils/formatDate";

export default function EventsPresentation({
  events,
  onOpenModal,
  onDelete,
  isModalOpen,
  onCloseModal,
  editingEvent,
  formMethods,
  onSave,
  isLoading,
  isDeleteModalOpen,
  eventToDelete,
  onCloseDelete,
  onConfirmDelete,
  isDeleting,
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  isListLoading,
}: IEventsPresentationProps) {
  const isMobile = useMediaQuery("(max-width: 700px)");

  return (
    <div>
      <PageHeader
        title="Eventos"
        subtitle="Cadastre e acompanhe seus eventos"
        actions={<Button onClick={() => onOpenModal()}>+ Novo Evento</Button>}
      />

      <Card className={isMobile ? "!p-0 overflow-hidden" : ""}>
        {isListLoading ? (
          <ListSkeleton
            variant={isMobile ? "cards" : "table"}
            rows={5}
            columns={5}
          />
        ) : isMobile ? (
          <EventCard
            events={events}
            onEdit={onOpenModal}
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
                {events.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      Nenhum evento encontrado.
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr
                      key={event.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {event.name}
                      </td>
                      <td className="px-6 py-4">{formatDateBR(event.date)}</td>
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
                        <ActionMenu
                          items={[
                            {
                              key: "edit",
                              label: "Editar",
                              icon: <Pencil className="h-4 w-4" />,
                              onClick: () => onOpenModal(event),
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

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={onCloseDelete}
        onConfirm={onConfirmDelete}
        title="Excluir evento"
        message="Tem certeza que deseja excluir o evento"
        itemName={eventToDelete?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}
