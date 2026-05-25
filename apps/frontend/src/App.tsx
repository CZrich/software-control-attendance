import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Kiosk } from './pages/Kiosk';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/Admin';

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const allowedRoles: string[] = ['SUPER_ADMIN', 'ADMIN', 'HR'];

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Kiosk />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/admin" replace /> : <Login />}
      />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
