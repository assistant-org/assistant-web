import React, { forwardRef, useEffect, useId, useRef } from "react";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Converts a pt-BR formatted money string ("1.234,56") back to a number (1234.56).
 * Returns NaN if the string is empty/invalid.
 */
export const parseMoney = (formatted: string): number => {
  const clean = formatted.replace(/\./g, "").replace(",", ".");
  return parseFloat(clean);
};

const formatMoney = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === "") return "";
  const str = String(value);

  // Se é um número (vindo de value externo), formata para display
  if (!isNaN(Number(str))) {
    const num = parseFloat(str);
    if (isNaN(num)) return "";
    return num.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Se já é uma string formatada (do input), retorna como está
  return str;
};

/**
 * Formata a entrada bruta do usuário (ex: "4973" ou "4973,00") para display pt-BR
 * "4973" → "4.973"
 * "4973," → "4.973,"
 * "4973,1" → "4.973,1"
 * "4973,00" → "4.973,00"
 */
const formatInputDisplay = (raw: string): string => {
  if (!raw) return "";

  // Permite apenas dígitos e uma vírgula
  let clean = raw.replace(/[^\d,]/g, "");

  // Garante apenas uma vírgula
  const parts = clean.split(",");
  if (parts.length > 2) {
    clean = parts[0] + "," + parts.slice(1).join("");
  }

  const [intPart, decPart] = clean.split(",");

  // Formata a parte inteira com separador de milhares
  const formattedInt = intPart
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    : "";

  // Retorna com parte decimal se houver
  return decPart !== undefined ? formattedInt + "," + decPart : formattedInt;
};

const extractNumbers = (value: string): string => value.replace(/\D/g, "");

// ─────────────────────────────────────────────
// Inner field — exact same logic as reference component
// ─────────────────────────────────────────────

interface MoneyInputFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "onKeyPress" | "onInput"
> {
  value?: string | null;
  onChange?: (value: string) => void;
}

const MoneyInputField = forwardRef<HTMLInputElement, MoneyInputFieldProps>(
  ({ value, onChange, disabled, readOnly, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const previousValueRef = useRef<string>("");

    useEffect(() => {
      if (typeof ref === "function") {
        ref(inputRef.current);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current =
          inputRef.current;
      }
    }, [ref]);

    useEffect(() => {
      previousValueRef.current = value ? formatMoney(value) : "";
    }, [value]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "Enter",
      ];
      const isNumber = /[0-9]/.test(e.key);
      const isAllowedKey = allowedKeys.includes(e.key);
      const isControlKey = e.ctrlKey || e.metaKey || e.altKey;
      if (!isNumber && !isAllowedKey && !isControlKey) {
        e.preventDefault();
      }
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;

      const input = e.target;
      const raw = input.value;

      // Formata a entrada (ex: "4973,00" → "4.973,00")
      const formatted = formatInputDisplay(raw);

      onChange?.(formatted);
      previousValueRef.current = formatted;

      // Posiciona cursor sempre no final do texto formatado
      setTimeout(() => {
        if (inputRef.current) {
          const finalLength = formatted.length;
          inputRef.current.setSelectionRange(finalLength, finalLength);
        }
      }, 0);
    };

    return (
      <input
        {...props}
        ref={inputRef}
        disabled={disabled}
        readOnly={readOnly}
        type="text"
        value={value ? formatMoney(value) : ""}
        onKeyPress={handleKeyPress}
        onInput={handleInput}
        onChange={() => {}}
      />
    );
  },
);

MoneyInputField.displayName = "MoneyInputField";

// ─────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────

interface MoneyInputProps {
  id?: string;
  label: string;
  value?: string | number | null;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

const MoneyInput: React.FC<MoneyInputProps> = ({
  id,
  label,
  value,
  onChange = () => {},
  placeholder = "0,00",
  error,
  disabled = false,
  readOnly = false,
}) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

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
        <MoneyInputField
          id={inputId}
          className={`block w-full appearance-none rounded-md border pl-9 pr-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none sm:text-sm dark:bg-gray-700 dark:text-white ${borderClass} ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800" : ""}`}
          value={value != null ? String(value) : ""}
          onChange={onChange}
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
