import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl transform rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white" id="modal-title">
              {title}
            </h3>
            <button
              type="button"
              className="rounded-md p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={onClose}
              aria-label="Close"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="px-6 py-5">
            {children}
        </div>

      </div>
    </div>
  );
};

export default Modal;
