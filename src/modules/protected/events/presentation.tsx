import React from "react";
import { IEventsPresentationProps } from "./types";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import EventForm from "./components/EventForm";
import TableActions from "../../../shared/components/TableActions";

export default function EventsPresentation({
  events,
  onOpenModal,
  isModalOpen,
  onCloseModal,
  editingEvent,
  formMethods,
  onSave,
  isLoading,
}: IEventsPresentationProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Eventos
        </h1>
        <Button onClick={() => onOpenModal()}>+ Novo Evento</Button>
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
                  Data
                </th>
                <th scope="col" className="px-6 py-3">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Faturamento Total
                </th>
                <th scope="col" className="px-6 py-3">
                  Ações
                </th>
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
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 capitalize">{event.type}</td>
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
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        title={editingEvent ? "Editar Evento" : "Novo Evento"}
      >
        <EventForm
          formMethods={formMethods}
          onSave={onSave}
          onCancel={onCloseModal}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  );
}
