import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react';
import Login from './auth/Login';
import authStore from './stores/authStore';
import './style.css';

// Placeholder Tasks component
const Tasks = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    authStore.logout();
    navigate('/login');
  };

  return (
    <div className="container">
      <h1>Task Management System</h1>
      <p>Hoş geldiniz! Burada task listesi görünecek.</p>
      <p>Giriş yapan kullanıcı: <strong>{authStore.user?.name}</strong></p>
      <p>Email: <strong>{authStore.user?.email}</strong></p>
      <p>Departman: <strong>{authStore.user?.department}</strong></p>
      <button onClick={handleLogout} className="logout-button">Çıkış Yap</button>
    </div>
  );
};

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return authStore.jwtToken ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = observer(() => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
});

export default App;
