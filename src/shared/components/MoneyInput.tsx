import React, { useId, useState, useEffect } from "react";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Converte número de centavos para string formatada pt-BR
 * 12345 (centavos) → "123,45"
 * 1234567 (centavos) → "12.345,67"
 */
const formatCentsToDisplay = (cents: number): string => {
  if (cents === 0) return "0,00";

  const valueStr = cents.toString().padStart(3, "0");
  const intPart = valueStr.slice(0, -2);
  const decPart = valueStr.slice(-2);

  // Adiciona separador de milhares
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formattedInt},${decPart}`;
};

/**
 * Converte centavos para número decimal
 * 12345 (centavos) → 123.45
 */
const centsToNumber = (cents: number): number => {
  return cents / 100;
};

/**
 * Converte número decimal para centavos
 * 123.45 → 12345 (centavos)
 */
const numberToCents = (num: number): number => {
  return Math.round(num * 100);
};

// ─────────────────────────────────────────────
// Componente Principal
// ─────────────────────────────────────────────

interface MoneyInputProps {
  id?: string;
  label: string;
  value?: number | null | undefined;
  onChange?: (value: number) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

const MoneyInput: React.FC<MoneyInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = "0,00",
  error,
  disabled = false,
  readOnly = false,
}) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  // Armazena os centavos internamente para facilitar a digitação
  const [cents, setCents] = useState<number>(0);

  // Sincroniza com o valor externo quando muda
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setCents(numberToCents(value));
    } else {
      setCents(0);
    }
  }, [value]);

  const displayValue = cents === 0 ? "" : formatCentsToDisplay(cents);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "Escape",
    ];

    const isNumber = /[0-9]/.test(e.key);
    const isAllowedKey = allowedKeys.includes(e.key);
    const isControlKey = e.ctrlKey || e.metaKey;

    if (!isNumber && !isAllowedKey && !isControlKey) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || readOnly) return;

    const input = e.target.value;
    const numbersOnly = input.replace(/\D/g, "");

    if (numbersOnly === "") {
      setCents(0);
      onChange?.(0);
      return;
    }

    const newCents = parseInt(numbersOnly, 10);
    setCents(newCents);
    onChange?.(centsToNumber(newCents));
  };

  const borderClass = error
    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
    : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500";

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <div className="mt-1 relative">
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 dark:text-gray-400 text-sm pointer-events-none select-none">
          R$
        </span>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          className={`block w-full appearance-none rounded-md border pl-9 pr-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none sm:text-sm dark:bg-gray-700 dark:text-white ${borderClass} ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800" : ""}`}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default MoneyInput;
