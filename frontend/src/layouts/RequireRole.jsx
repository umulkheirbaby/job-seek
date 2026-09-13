import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../store/AppContext';

export default function RequireRole({ roles }) {
  const { user } = useApp();

  if (!roles.includes(user.role)) {
    return <Navigate to="/account" replace />;
  }

  return <Outlet />;
}
