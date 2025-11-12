
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext.tsx';

const ProtectedRoute: React.FC = () => {
  // FIX: Cast context to AppContextType to resolve property access errors.
  const context = useContext(AppContext) as AppContextType;

  if (!context) {
    return <div>Loading...</div>; // Or some loading spinner
  }

  if (!context.currentUser) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they login.
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;