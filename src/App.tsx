
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AuthPage } from './pages/auth/AuthPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProfilePage } from './pages/profile/ProfilePage';
import { StudyMaterialsPage } from './pages/study/StudyMaterialsPage';
import PrivateRoute from './components/auth/PrivateRoute';
import { StarredPage } from './pages/storage/StarredPage';
import { DownloadsPage } from './pages/storage/DownloadsPage';
import { TrashPage } from './pages/storage/TrashPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';

function App() {
  const skipAuth = true;

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
          <Routes>
            {/* Redirect root to auth page or dashboard for testing */}
            <Route 
              path="/" 
              element={
                skipAuth ? 
                <Navigate to="/dashboard" replace /> : 
                <Navigate to="/auth" replace />
              } 
            />
            
            {/* Auth routes */}
            <Route path="/auth/*" element={<AuthPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            
            {/* Student routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute role="student">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <Dashboard />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/study-materials"
              element={
                <PrivateRoute role="student">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <StudyMaterialsPage />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/starred"
              element={
                <PrivateRoute role="student">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <StarredPage />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/downloads"
              element={
                <PrivateRoute role="student">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <DownloadsPage />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/trash"
              element={
                <PrivateRoute role="student">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <TrashPage />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute role="student">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <SettingsPage />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            
            {/* Faculty routes */}
            <Route
              path="/faculty/dashboard"
              element={
                <PrivateRoute role="faculty">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <FacultyDashboard />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/starred"
              element={
                <PrivateRoute role="faculty">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <StarredPage />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/trash"
              element={
                <PrivateRoute role="faculty">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <TrashPage />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/settings"
              element={
                <PrivateRoute role="faculty">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <SettingsPage />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            
            {/* Admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute role="admin">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <AdminDashboard />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/starred"
              element={
                <PrivateRoute role="admin">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <StarredPage />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/downloads"
              element={
                <PrivateRoute role="admin">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <DownloadsPage />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/trash"
              element={
                <PrivateRoute role="admin">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <TrashPage />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <PrivateRoute role="admin">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <SettingsPage />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            
            {/* Profile route */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <ProfilePage />
                    </div>
                  </div>
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
