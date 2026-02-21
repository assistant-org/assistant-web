import React from "react";
import Button from "./Button";

interface FilterButtonProps {
  onClick: () => void;
  hasActiveFilters: boolean;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  onClick,
  hasActiveFilters,
}) => {
  return (
    <Button onClick={onClick} variant="secondary">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
      </svg>
      Filtros
      {hasActiveFilters && (
        <span className="ml-2 bg-indigo-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          !
        </span>
      )}
    </Button>
  );
};

export default FilterButton;
