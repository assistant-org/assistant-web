import React, { useState } from "react";
import { X } from "lucide-react";
import Modal from "./Modal";
import DiscardConfirmDialog from "./DiscardConfirmDialog";
import { useMediaQuery } from "../hooks/useMediaQuery";

export interface FormShellApi {
  requestClose: () => void;
}

interface FormShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode | ((api: FormShellApi) => React.ReactNode);
  /** When true, closing asks for discard confirmation. */
  requireConfirmClose?: boolean;
  footer?: React.ReactNode | ((api: FormShellApi) => React.ReactNode);
}

/**
 * Desktop: centered Modal. Mobile: full-screen shell.
 * Optional discard confirmation on close (X / backdrop / requestClose).
 */
export default function FormShell({
  isOpen,
  onClose,
  title,
  children,
  requireConfirmClose = false,
  footer,
}: FormShellProps) {
  const isMobile = useMediaQuery("(max-width: 700px)");
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);

  if (!isOpen) return null;

  const requestClose = () => {
    if (requireConfirmClose) {
      setIsDiscardOpen(true);
    } else {
      onClose();
    }
  };

  const confirmDiscard = () => {
    setIsDiscardOpen(false);
    onClose();
  };

  const api: FormShellApi = { requestClose };
  const body = typeof children === "function" ? children(api) : children;
  const footerNode = typeof footer === "function" ? footer(api) : footer;

  return (
    <>
      {isMobile ? (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
          <div
            className="flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700"
            style={{
              paddingTop: "max(env(safe-area-inset-top), 1rem)",
              paddingBottom: "0.75rem",
            }}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button
              type="button"
              onClick={requestClose}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Fechar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">{body}</div>
          {footerNode && (
            <div
              className="border-t border-gray-200 dark:border-gray-700 px-4"
              style={{
                paddingTop: "0.75rem",
                paddingBottom: "max(env(safe-area-inset-bottom), 1rem)",
              }}
            >
              {footerNode}
            </div>
          )}
        </div>
      ) : (
        <Modal isOpen={isOpen} onClose={requestClose} title={title}>
          {body}
          {footerNode && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              {footerNode}
            </div>
          )}
        </Modal>
      )}

      <DiscardConfirmDialog
        isOpen={isDiscardOpen}
        onCancel={() => setIsDiscardOpen(false)}
        onConfirm={confirmDiscard}
      />
    </>
  );
}
