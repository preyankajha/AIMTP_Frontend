import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Check if user is logged in and has admin role
  if (!user || user.role !== 'admin') {
    // Redirect non-admins back to user dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminProtectedRoute;
