import React from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import { MerchantDashboard } from './components/merchant/merchantView';
import { EmployeeTipsView } from './components/employee/employeeView';

const MerchantRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <MerchantDashboard merchantId={id!} />;
};

const EmployeeRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <EmployeeTipsView employeeId={id!} />;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LandingPage />} />
      <Route path="/merchants/:id/tips/summary" element={<MerchantRoute />} />
      <Route path="/employees/:id/tips" element={<EmployeeRoute />} />
    </Routes>
  );
};

export default App;