import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled = false }) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const trackClasses = checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600';
  const thumbClasses = checked ? 'translate-x-5' : 'translate-x-0';

  return (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${trackClasses} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      role="switch"
      aria-checked={checked}
      onClick={handleToggle}
      disabled={disabled}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${thumbClasses}`}
      />
    </button>
  );
};

export default Switch;
