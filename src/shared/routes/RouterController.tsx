
import React from 'react';
import { useSession } from '../hooks/useSession';
import ProtectedRoutes from './protected-routes';
import AuthRoutes from './auth-routes';

const RouterController: React.FC = () => {
  const { isAuthenticated } = useSession();
  return isAuthenticated ? <ProtectedRoutes /> : <AuthRoutes />;
};

export default RouterController;
