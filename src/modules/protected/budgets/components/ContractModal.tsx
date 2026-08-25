import React, { useEffect, useRef, useState } from "react";
import Button from "../../../../shared/components/Button";
import OverlayBackdrop from "../../../../shared/components/OverlayBackdrop";
import { PROPOSAL_BRAND } from "../../../../shared/services/budgets/pdf/proposal.brand";
import { formatCpf, isValidCpf } from "../../../../shared/utils/validateCpf";

export type ContractVariant = "standard" | "auto_servico";

export interface ContractModalValues {
  cpf: string;
  clientStreet: string;
  clientNumber: string;
  clientZip: string;
  clientCityState: string;
  eventLocation: string;
  eventDate: string;
  paymentMethodId: string;
  signalDueDate: string;
}

/** @deprecated Use ContractModalValues */
export type ConcludeModalValues = ContractModalValues;

interface ContractModalProps {
  clientName: string;
  initialEventDate?: string | null;
  onConfirm: (values: ContractModalValues) => void;
  onCancel: () => void;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white";

async function lookupCep(cepDigits: string): Promise<{
  street: string;
  cityState: string;
} | null> {
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      erro?: boolean;
      logradouro?: string;
      localidade?: string;
      uf?: string;
    };
    if (data.erro) return null;
    const cityState =
      data.localidade && data.uf ? `${data.localidade}-${data.uf}` : "";
    return {
      street: data.logradouro || "",
      cityState,
    };
  } catch {
    return null;
  }
}

export default function ContractModal({
  clientName,
  initialEventDate,
  onConfirm,
  onCancel,
}: ContractModalProps) {
  const [cpf, setCpf] = useState("");
  const [clientStreet, setClientStreet] = useState("");
  const [clientNumber, setClientNumber] = useState("");
  const [clientZip, setClientZip] = useState("");
  const [clientCityState, setClientCityState] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDate, setEventDate] = useState(
    () => (initialEventDate || "").slice(0, 10),
  );
  const [paymentMethodId, setPaymentMethodId] = useState<string>(
    PROPOSAL_BRAND.paymentMethods[0].id,
  );
  const [signalDueDate, setSignalDueDate] = useState("");
  const [error, setError] = useState("");
  const [cpfError, setCpfError] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const lastLookedUpCep = useRef("");

  const formatZip = (raw: string): string => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  useEffect(() => {
    const digits = clientZip.replace(/\D/g, "");
    if (digits.length !== 8) {
      setCepError("");
      return;
    }
    if (digits === lastLookedUpCep.current) return;

    let cancelled = false;
    setCepLoading(true);
    setCepError("");
    void lookupCep(digits).then((addr) => {
      if (cancelled) return;
      setCepLoading(false);
      lastLookedUpCep.current = digits;
      if (!addr) {
        setCepError("CEP não encontrado.");
        return;
      }
      if (addr.street) setClientStreet(addr.street);
      if (addr.cityState) setClientCityState(addr.cityState);
    });

    return () => {
      cancelled = true;
    };
  }, [clientZip]);

  const handleSubmit = () => {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (!isValidCpf(cleanCpf)) {
      setCpfError("CPF inválido. Verifique os dígitos informados.");
      return;
    }
    setCpfError("");
    if (!clientStreet.trim()) {
      setError("Informe o endereço (rua/logradouro).");
      return;
    }
    if (!clientNumber.trim()) {
      setError("Informe o número do endereço.");
      return;
    }
    const zipDigits = clientZip.replace(/\D/g, "");
    if (zipDigits.length !== 8) {
      setError("CEP inválido (8 dígitos).");
      return;
    }
    if (!clientCityState.trim()) {
      setError("Informe a cidade/UF.");
      return;
    }
    if (!eventLocation.trim()) {
      setError("Informe o local do evento.");
      return;
    }
    if (!eventDate) {
      setError("Informe a data do evento.");
      return;
    }
    if (!signalDueDate) {
      setError("Informe a data do sinal.");
      return;
    }
    setError("");
    onConfirm({
      cpf: formatCpf(cleanCpf),
      clientStreet: clientStreet.trim(),
      clientNumber: clientNumber.trim(),
      clientZip: formatZip(clientZip),
      clientCityState: clientCityState.trim(),
      eventLocation: eventLocation.trim(),
      eventDate,
      paymentMethodId,
      signalDueDate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <OverlayBackdrop onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Gerar contrato
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
              onChange={(e) => {
                setCpf(formatCpf(e.target.value));
                setCpfError("");
                setError("");
              }}
              aria-invalid={Boolean(cpfError)}
              className={`${inputClass} ${
                cpfError ? "border-red-500 focus:border-red-500" : ""
              }`}
            />
            {cpfError ? (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {cpfError}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Endereço
              </label>
              <input
                type="text"
                value={clientStreet}
                onChange={(e) => setClientStreet(e.target.value)}
                placeholder="Rua / Logradouro"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nº
              </label>
              <input
                type="text"
                value={clientNumber}
                onChange={(e) => setClientNumber(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CEP {cepLoading ? "(buscando…)" : ""}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={clientZip}
                placeholder="00000-000"
                onChange={(e) => {
                  lastLookedUpCep.current = "";
                  setClientZip(formatZip(e.target.value));
                  setCepError("");
                }}
                className={inputClass}
              />
              {cepError ? (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {cepError}
                </p>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cidade / UF
              </label>
              <input
                type="text"
                value={clientCityState}
                onChange={(e) => setClientCityState(e.target.value)}
                placeholder="Capela do Alto-SP"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Local do evento
            </label>
            <input
              type="text"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              placeholder="Ex: nos Vicentinos"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data do evento
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data do sinal (prazo)
            </label>
            <input
              type="date"
              value={signalDueDate}
              onChange={(e) => setSignalDueDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Forma de pagamento
            </label>
            <div className="space-y-2">
              {PROPOSAL_BRAND.paymentMethods.map((method) => {
                const selected = paymentMethodId === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethodId(method.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      selected
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {method.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {method.detail}
                    </p>
                  </button>
                );
              })}
            </div>
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
            Gerar contrato
          </Button>
        </div>
      </div>
    </div>
  );
}
