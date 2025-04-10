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
import { StarredPage as StudentStarredPage } from './pages/storage/StarredPage';
import { DownloadsPage } from './pages/storage/DownloadsPage';
import { TrashPage as StudentTrashPage } from './pages/storage/TrashPage';
import { SettingsPage as StudentSettingsPage } from './pages/settings/SettingsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import PlacementResources from './pages/placement/PlacementResources';
import { SubjectDetailPage } from './pages/study/SubjectDetailPage';

// Import faculty pages
import { AnalyticsPage } from './pages/faculty/AnalyticsPage';
import { StudentsPage } from './pages/faculty/StudentsPage';
import { StarredPage as FacultyStarredPage } from './pages/faculty/StarredPage';
import { TrashPage as FacultyTrashPage } from './pages/faculty/TrashPage';
import { SettingsPage as FacultySettingsPage } from './pages/faculty/SettingsPage';

// Faculty upload components
import { UploadWorkflow } from './components/faculty/UploadWorkflow';

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
              path="/study/:subject"
              element={
                <PrivateRoute role="student">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <SubjectDetailPage />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/placement"
              element={
                <PrivateRoute role="student">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <PlacementResources />
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
                      <StudentStarredPage />
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
                      <StudentTrashPage />
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
                      <StudentSettingsPage />
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
              path="/faculty/upload"
              element={
                <PrivateRoute role="faculty">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <UploadWorkflow 
                          onSelectOption={(option, data) => {
                            console.log("Selected option:", option, data);
                            if (option === 'direct-upload' && data) {
                              // Handle the direct upload with the provided data
                              if (data.resourceType === 'placement') {
                                console.log("Handling placement resource upload:", data);
                                // Additional logic for placement resource could go here
                              }
                            }
                          }} 
                          onCancel={() => {
                            // Navigate back to faculty dashboard
                            window.location.href = '/faculty/dashboard';
                          }}
                          showAvailableSubjects={true}
                        />
                      </div>
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/analytics"
              element={
                <PrivateRoute role="faculty">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <AnalyticsPage />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/students"
              element={
                <PrivateRoute role="faculty">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <StudentsPage />
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
                      <FacultyStarredPage />
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
                      <FacultyTrashPage />
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
                      <FacultySettingsPage />
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
              path="/admin/upload"
              element={
                <PrivateRoute role="admin">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <UploadWorkflow 
                          onSelectOption={(option, data) => {
                            console.log("Admin selected option:", option, data);
                          }}
                          onCancel={() => {
                            window.location.href = '/admin/dashboard';
                          }}
                          showAvailableSubjects={true}
                        />
                      </div>
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute role="admin">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
                        <p>This is the admin user management page.</p>
                      </div>
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/resources"
              element={
                <PrivateRoute role="admin">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <h1 className="text-2xl font-bold mb-6">All Resources</h1>
                        <p>This is the admin resource management page.</p>
                      </div>
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
                      <StudentStarredPage />
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
                      <StudentTrashPage />
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
                      <StudentSettingsPage />
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
