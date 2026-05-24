import React, { useState } from 'react';
import { Kiosk } from './pages/Kiosk';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/Admin';
import { AuthProvider, useAuth } from './context/AuthContext';

function Router() {
  const { token } = useAuth();
  const [page, setPage] = useState<'kiosk' | 'login' | 'admin'>('kiosk');

  if (token && page === 'login') {
    setPage('admin');
  }

  const navigate = (to: 'kiosk' | 'login' | 'admin') => {
    setPage(to);
  };

  return (
    <div>
      {page === 'kiosk' && <Kiosk onNavigate={navigate} />}
      {page === 'login' && <Login onNavigate={navigate} />}
      {page === 'admin' && <AdminDashboard onNavigate={navigate} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
