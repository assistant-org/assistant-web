import React, { InputHTMLAttributes } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  register: UseFormRegisterReturn;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  id,
  register,
  error,
  type,
  className,
  ...props
}) => {
  const isDate = type === "date";
  const baseClass = isDate
    ? "block w-full min-h-11 rounded-md border px-3 py-2 text-base placeholder-gray-400 shadow-sm focus:outline-none sm:min-h-0 sm:text-sm"
    : "block w-full appearance-none rounded-md border px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none sm:text-sm";

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <div className="mt-1">
        <input
          id={id}
          type={type}
          {...register}
          {...props}
          className={`${baseClass} ${
            error
              ? "border-red-500 dark:bg-gray-700 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
          } ${className ?? ""}`}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
};

export default Input;
