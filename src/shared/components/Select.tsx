import React, { SelectHTMLAttributes } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  register: UseFormRegisterReturn;
  error?: string;
  children?: React.ReactNode;
  options?: any[];
  optionName?: string;
  optionId?: string;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  id,
  register,
  error,
  children,
  options,
  optionName = "name",
  optionId = "id",
  placeholder = "Selecione",
  ...props
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <div className="mt-1">
        <select
          id={id}
          {...register}
          {...props}
          className={`block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm ${
            error
              ? "border-red-500 dark:bg-gray-700 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
          }`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options
            ? options.map((option) => (
                <option key={option[optionId]} value={option[optionId]}>
                  {option[optionName]}
                </option>
              ))
            : children}
        </select>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
};

export default Select;
