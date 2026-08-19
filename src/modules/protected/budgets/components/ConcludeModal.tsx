import React, { useState } from "react";
import Button from "../../../../shared/components/Button";
import Input from "../../../../shared/components/Input";

export type PaymentMethod =
  | "PIX"
  | "CARTAO_CREDITO"
  | "CARTAO_DEBITO"
  | "DINHEIRO"
  | "PARCELADO_50_50";

export interface ConcludeModalValues {
  cpf: string;
  paymentMethod: PaymentMethod;
  signalDueDate: string;
}

interface ConcludeModalProps {
  clientName: string;
  onConfirm: (values: ConcludeModalValues) => void;
  onCancel: () => void;
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "PIX", label: "PIX" },
  { value: "CARTAO_CREDITO", label: "Cartão de Crédito" },
  { value: "CARTAO_DEBITO", label: "Cartão de Débito" },
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "PARCELADO_50_50", label: "Parcelado 50/50" },
];

export default function ConcludeModal({
  clientName,
  onConfirm,
  onCancel,
}: ConcludeModalProps) {
  const [cpf, setCpf] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [signalDueDate, setSignalDueDate] = useState("");
  const [error, setError] = useState("");

  const formatCpf = (raw: string): string => {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const handleSubmit = () => {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      setError("CPF inválido (11 dígitos)");
      return;
    }
    if (!signalDueDate) {
      setError("Informe a data do sinal");
      return;
    }
    setError("");
    onConfirm({ cpf, paymentMethod, signalDueDate });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Concluir orçamento
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Cliente: <strong>{clientName}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CPF do contratante
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={cpf}
              placeholder="000.000.000-00"
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Forma de pagamento
            </label>
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentMethod)
              }
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
            >
              {PAYMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data do sinal (prazo)
            </label>
            <input
              type="date"
              value={signalDueDate}
              onChange={(e) => setSignalDueDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
            />
          </div>

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Confirmar e gerar contrato
          </Button>
        </div>
      </div>
    </div>
  );
}
