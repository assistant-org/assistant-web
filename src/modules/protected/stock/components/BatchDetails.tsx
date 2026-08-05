import React from "react";
import {
  UnitOfMeasure,
} from "../../../../shared/services/products/types";
import {
  StockBatch,
  StockBatchStatus,
  StockMovementDirection,
  StockMovementType,
} from "../../../../shared/services/stock/types";
import { formatDateBR } from "../../../../shared/utils/formatDate";

const UNIT_SHORT: Record<string, string> = {
  [UnitOfMeasure.LITER]: "L",
  [UnitOfMeasure.UNIT]: "un",
  [UnitOfMeasure.KG]: "kg",
};

const TYPE_LABELS: Record<StockMovementType, string> = {
  [StockMovementType.ENTRY]: "Entrada",
  [StockMovementType.EXIT]: "Saída",
  [StockMovementType.LOSS]: "Perda",
  [StockMovementType.INTERNAL_CONSUMPTION]: "Consumo Interno",
  [StockMovementType.ADJUSTMENT]: "Ajuste",
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <div className="mt-1 text-sm text-gray-900 dark:text-white">{children}</div>
  </div>
);

interface BatchDetailsProps {
  batch: StockBatch;
  eventName?: string | null;
  resolveEventName?: (id?: string | null) => string | null;
}

export default function BatchDetails({
  batch,
  eventName,
  resolveEventName,
}: BatchDetailsProps) {
  const unit = UNIT_SHORT[batch.productUnit || ""] || "";
  const consumed = Math.max(0, batch.initialQuantity - batch.availableQuantity);
  const movements = batch.movements || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Produto">{batch.productName || batch.productId}</Field>
        <Field label="Status">
          {batch.status === StockBatchStatus.ACTIVE ? "Ativo" : "Encerrado"}
        </Field>
        <Field label="Evento">{eventName || "-"}</Field>
        <Field label="Data de entrada">
          {formatDateBR(batch.entryDate)}
        </Field>
        <Field label="Validade">
          {formatDateBR(batch.expiryDate)}
        </Field>
        <Field label="Quantidade inicial">
          {batch.initialQuantity.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} {unit}
        </Field>
        <Field label="Quantidade disponível">
          {batch.availableQuantity.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} {unit}
        </Field>
        <Field label="Quantidade consumida">
          {consumed.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} {unit}
        </Field>
        <Field label="Valor do lote">
          {formatCurrency(batch.availableQuantity * batch.unitValue)}
        </Field>
        <Field label="Valor unitário">{formatCurrency(batch.unitValue)}</Field>
        {batch.observations && (
          <div className="sm:col-span-2">
            <Field label="Observações">{batch.observations}</Field>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Histórico de movimentações
        </h4>
        {movements.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma movimentação registrada.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 text-gray-500">
                <tr>
                  <th className="px-3 py-2">Data</th>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2 text-right">Qtd.</th>
                  <th className="px-3 py-2">Evento</th>
                  <th className="px-3 py-2">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td className="px-3 py-2">
                      {formatDateBR(m.date)}
                    </td>
                    <td className="px-3 py-2">{TYPE_LABELS[m.type] || m.type}</td>
                    <td
                      className={`px-3 py-2 text-right font-medium ${
                        m.direction === StockMovementDirection.IN
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {m.direction === StockMovementDirection.IN ? "+" : "-"}
                      {m.quantity.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {resolveEventName?.(m.eventId) || m.eventId || "-"}
                    </td>
                    <td className="px-3 py-2 text-gray-500">{m.reason || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
