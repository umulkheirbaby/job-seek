import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../store/AppContext';

export default function RequireAuth() {
  const { user, loading } = useApp();
  const location = useLocation();

  if (loading) {
    return <p className="status-note">Checking your session…</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
