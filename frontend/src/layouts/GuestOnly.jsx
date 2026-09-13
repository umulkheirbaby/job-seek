import { Navigate, Outlet } from 'react-router-dom';
import { homePathFor } from '../features/auth/homePath';
import { useApp } from '../store/AppContext';

export default function GuestOnly() {
  const { user, loading } = useApp();

  if (loading) {
    return <p className="status-note">Checking your session…</p>;
  }

  if (user) {
    return <Navigate to={homePathFor(user)} replace />;
  }

  return <Outlet />;
}
