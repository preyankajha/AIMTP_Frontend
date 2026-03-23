import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import CreateTransferPage from './pages/CreateTransferPage';
import MyTransfersPage from './pages/MyTransfersPage';
import MatchesPage from './pages/MatchesPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';

import DashboardLayout from './components/DashboardLayout';
import ProfilePage from './pages/ProfilePage';
import SearchTransfersPage from './pages/SearchTransfersPage';
import LandingPage from './pages/LandingPage';
import TermsPage from './pages/TermsPage';
import TransferDetailsPage from './pages/TransferDetailsPage';

import { AuthProvider } from './context/AuthProvider';
import { MasterDataProvider } from './context/MasterDataContext';
import AnalyticsTracker from './components/AnalyticsTracker';

// Admin Components
import AdminLayout from './admin/components/AdminLayout';
import AdminProtectedRoute from './admin/components/AdminProtectedRoute';
import AdminDashboardPage from './admin/pages/AdminDashboardPage';
import AdminUsersPage from './admin/pages/AdminUsersPage';
import AdminTransfersPage from './admin/pages/AdminTransfersPage';
import AdminMatchesPage from './admin/pages/AdminMatchesPage';
import AdminAnalyticsPage from './admin/pages/AdminAnalyticsPage';
import AdminSettingsPage from './admin/pages/AdminSettingsPage';
import AdminMasterDataPage from './admin/pages/AdminMasterDataPage';

function App() {
  return (
    <AuthProvider>
      <MasterDataProvider>
        <Router>
          <AnalyticsTracker />
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/transfers/:id" element={<TransferDetailsPage />} />

          {/* Protected Routes inside DashboardLayout */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/transfers/create" element={<CreateTransferPage />} />
            <Route path="/transfers/edit/:id" element={<CreateTransferPage />} />
            <Route path="/transfers/my" element={<MyTransfersPage />} />
            <Route path="/transfers/search" element={<SearchTransfersPage />} />
            <Route path="/matches/my" element={<MatchesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Route>

          {/* Admin Routes */}
          <Route
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/transfers" element={<AdminTransfersPage />} />
            <Route path="/admin/matches" element={<AdminMatchesPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/master-data" element={<AdminMasterDataPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </MasterDataProvider>
    </AuthProvider>
  );
}

export default App;
