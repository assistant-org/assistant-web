import React, { useEffect, useState } from "react";
import Button from "../../../../shared/components/Button";
import Modal from "../../../../shared/components/Modal";
import { STOCK_SELLER_PRESETS } from "../../../../shared/services/stock/stockNotify.config";
import {
  buildStockEntryWhatsAppLink,
  StockEntryNotifyLine,
} from "../../../../shared/services/stock/whatsapp/buildStockEntryWhatsAppLink";

interface StockSellerNotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lines: StockEntryNotifyLine[];
  entryDate?: string | null;
}

export default function StockSellerNotifyModal({
  isOpen,
  onClose,
  lines,
  entryDate,
}: StockSellerNotifyModalProps) {
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (isOpen) setPhone("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) return;
    const url = buildStockEntryWhatsAppLink({ phone, lines, entryDate });
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  const canSend = phone.replace(/\D/g, "").length >= 10;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Avisar vendedor">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Envie o resumo desta entrada de estoque pelo WhatsApp, ou pule esta
          etapa.
        </p>

        <div>
          <label
            htmlFor="seller-phone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Telefone do vendedor
          </label>
          <input
            id="seller-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(15) 99999-9999"
            className="mt-1 block w-full min-h-11 rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STOCK_SELLER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setPhone(preset.phone)}
              className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {lines.length > 0 && (
          <ul className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {lines.map((l, i) => (
              <li key={`${l.productName}-${i}`}>
                {l.productName} —{" "}
                {l.quantity.toLocaleString("pt-BR", {
                  maximumFractionDigits: 2,
                })}{" "}
                L
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Pular
          </Button>
          <Button type="button" onClick={handleSend} disabled={!canSend}>
            Enviar WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  );
}
