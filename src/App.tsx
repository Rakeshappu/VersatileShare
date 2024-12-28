import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { AuthPage } from './pages/auth/AuthPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { Dashboard } from './components/dashboard/Dashboard';
import PrivateRoute from './components/auth/PrivateRoute';
import { Sidebar } from 'lucide-react';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          {/* <Header /> */}
          {/* <Sidebar/> */}
          <Routes>
            {/* Redirect root to auth page */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            
            {/* Auth routes */}
            <Route path="/auth/*" element={<AuthPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            
            {/* Protected routes */}
            <Route
              path="/faculty/dashboard"
              element={
                <PrivateRoute role="faculty">
                  <Header />
                  <FacultyDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute role="student">
                  <Header />
                  <Sidebar/>
                  <Dashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;