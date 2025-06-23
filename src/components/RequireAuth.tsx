import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const RequireAuth: React.FC<{ isAuthenticated: boolean; children: React.ReactNode }> = ({ isAuthenticated, children }) => {
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

export default RequireAuth;
