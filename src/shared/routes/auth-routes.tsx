
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginContainer from '../../modules/auth/login/container';

const AuthRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginContainer />} />
      {/* Add other public routes like /forgot-password here */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AuthRoutes;
