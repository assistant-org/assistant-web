import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from "react-hook-form";

interface SelectProps<T extends FieldValues> {
  label: string;
  id: string;
  name: FieldPath<T>;
  control: Control<T>;
  options: Record<string, any>[];
  optionName?: string;
  optionId?: string;
  /** Visual only — shown on the trigger when value is null/undefined. Not an option. */
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  onValueChange?: (value: string | null) => void;
}

function SelectInner({
  label,
  id,
  value,
  onChange,
  onBlur,
  options,
  optionName,
  optionId,
  placeholder,
  error,
  disabled,
  onValueChange,
}: {
  label: string;
  id: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
  onBlur: () => void;
  options: Record<string, any>[];
  optionName: string;
  optionId: string;
  placeholder: string;
  error?: string;
  disabled?: boolean;
  onValueChange?: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () =>
      value != null && value !== ""
        ? options.find((o) => String(o[optionId]) === String(value))
        : undefined,
    [options, optionId, value],
  );

  const hasValue = selected != null;

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        onBlur();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        onBlur();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onBlur]);

  // Clear commits "" (not null) so Zod z.string().min(1) shows required messages.
  const commit = (next: string) => {
    onChange(next);
    onValueChange?.(next === "" ? null : next);
  };

  const borderClass = error
    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
    : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500";

  return (
    <div ref={rootRef}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <div className="mt-1 relative">
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => {
            if (disabled) return;
            setOpen((v) => !v);
          }}
          onBlur={() => {
            // Keep open while interacting with list; blur handled on outside click
          }}
          className={`relative flex w-full items-center rounded-md border bg-white px-3 py-2 text-left shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-gray-700 ${borderClass} ${
            hasValue ? "pr-16" : "pr-9"
          } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800" : "cursor-pointer"}`}
        >
          <span
            className={`block truncate ${
              hasValue
                ? "text-gray-900 dark:text-white"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {hasValue ? String(selected[optionName]) : placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {hasValue && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              commit("");
              setOpen(false);
            }}
            aria-label="Limpar seleção"
            className="absolute right-8 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        )}

        {open && !disabled && (
          <ul
            role="listbox"
            className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg focus:outline-none dark:border-gray-600 dark:bg-gray-700"
          >
            {options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">Sem opções</li>
            ) : (
              options.map((option) => {
                const optId = String(option[optionId]);
                const isSelected = hasValue && String(value) === optId;
                return (
                  <li key={optId} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-gray-600 ${
                        isSelected
                          ? "bg-indigo-50 text-indigo-700 dark:bg-gray-600 dark:text-indigo-300"
                          : "text-gray-900 dark:text-white"
                      }`}
                      onClick={() => {
                        commit(optId);
                        setOpen(false);
                        onBlur();
                      }}
                    >
                      {String(option[optionName])}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

function Select<T extends FieldValues>({
  label,
  id,
  name,
  control,
  options,
  optionName = "name",
  optionId = "id",
  placeholder = "Selecione",
  error,
  disabled = false,
  onValueChange,
}: SelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <SelectInner
          label={label}
          id={id}
          value={field.value as string | null | undefined}
          onChange={field.onChange}
          onBlur={field.onBlur}
          options={options}
          optionName={optionName}
          optionId={optionId}
          placeholder={placeholder}
          error={error}
          disabled={disabled}
          onValueChange={onValueChange}
        />
      )}
    />
  );
}

export default Select;
