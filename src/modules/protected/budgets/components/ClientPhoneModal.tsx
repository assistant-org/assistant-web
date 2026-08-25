import React, { useState } from "react";
import Button from "../../../../shared/components/Button";
import Modal from "../../../../shared/components/Modal";
import {
  formatPhoneBR,
  isValidPhoneBR,
} from "../../../../shared/services/budgets/format";

interface ClientPhoneModalProps {
  clientName: string;
  initialPhone?: string;
  isSaving?: boolean;
  onConfirm: (phone: string) => void;
  onCancel: () => void;
}

export default function ClientPhoneModal({
  clientName,
  initialPhone = "",
  isSaving,
  onConfirm,
  onCancel,
}: ClientPhoneModalProps) {
  const [phone, setPhone] = useState(() => formatPhoneBR(initialPhone));
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!isValidPhoneBR(phone)) {
      setError("Informe um telefone válido com DDD.");
      return;
    }
    setError("");
    onConfirm(phone);
  };

  return (
    <Modal isOpen title="Telefone do cliente" onClose={onCancel}>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Informe o telefone de <strong>{clientName}</strong> para enviar pelo
        WhatsApp.
      </p>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="wa-client-phone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Telefone
          </label>
          <input
            id="wa-client-phone"
            type="tel"
            inputMode="numeric"
            placeholder="(11) 99999-9999"
            value={phone}
            disabled={isSaving}
            onChange={(e) => {
              setPhone(formatPhoneBR(e.target.value));
              setError("");
            }}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
          />
          {error ? (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            isLoading={isSaving}
            disabled={isSaving}
          >
            Continuar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
