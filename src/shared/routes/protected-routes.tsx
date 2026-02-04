import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomeContainer from '../../modules/protected/home/container';
import ProtectedLayout from '../components/ProtectedLayout';
import CategoriesContainer from '../../modules/protected/categories/container';
import EntriesContainer from '../../modules/protected/entries/container';
import EventsContainer from '../../modules/protected/events/container';
import OutputsContainer from '../../modules/protected/outputs/container';
import StockContainer from '../../modules/protected/stock/container';

const ProtectedRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<HomeContainer />} />
        <Route path="/entries" element={<EntriesContainer />} />
        <Route path="/outputs" element={<OutputsContainer />} />
        <Route path="/categories" element={<CategoriesContainer />} />
        <Route path="/events" element={<EventsContainer />} />
        <Route path="/stock" element={<StockContainer />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
};

export default ProtectedRoutes;
