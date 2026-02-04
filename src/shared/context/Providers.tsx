import React, { ReactNode } from 'react';
import { SessionProvider } from './SessionContext';
import { HashRouter } from 'react-router-dom';

interface ProvidersProps {
  children: ReactNode;
}

// Fix: Changed component to use React.FC for consistency and to fix TypeScript's children prop inference.
const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <HashRouter>
      <SessionProvider>{children}</SessionProvider>
    </HashRouter>
  );
};

export default Providers;
