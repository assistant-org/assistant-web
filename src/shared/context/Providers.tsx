import React, { ReactNode } from "react";
import { SessionProvider } from "./SessionContext";
import { ToastProvider } from "./ToastContext";
import { HashRouter } from "react-router-dom";

interface ProvidersProps {
  children: ReactNode;
}

// Fix: Changed component to use React.FC for consistency and to fix TypeScript's children prop inference.
const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <HashRouter>
      <ToastProvider>
        <SessionProvider>{children}</SessionProvider>
      </ToastProvider>
    </HashRouter>
  );
};

export default Providers;
