import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomeContainer from '../../modules/protected/home/container';
import ProtectedLayout from '../components/ProtectedLayout';
import CategoriesContainer from '../../modules/protected/categories/container';
import FinancialContainer from '../../modules/protected/financial/container';
import EventsContainer from '../../modules/protected/events/container';
import StockContainer from '../../modules/protected/stock/container';
import ProductsContainer from '../../modules/protected/products/container';

const ProtectedRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<HomeContainer />} />
        <Route path="/financial" element={<FinancialContainer />} />
        <Route path="/entries" element={<Navigate to="/financial" replace />} />
        <Route path="/outputs" element={<Navigate to="/financial" replace />} />
        <Route path="/categories" element={<CategoriesContainer />} />
        <Route path="/events" element={<EventsContainer />} />
        <Route path="/products" element={<ProductsContainer />} />
        <Route path="/stock" element={<StockContainer />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
};

export default ProtectedRoutes;
